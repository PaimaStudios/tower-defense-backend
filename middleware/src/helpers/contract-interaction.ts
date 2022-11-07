import { numberToHex, utf8ToHex } from "web3-utils";

import { getTxTemplate } from "paima-engine/paima-tx";
import { retrieveFee, wait } from "paima-engine/paima-utils";
import { buildEndpointErrorFxn, CatapultMiddlewareErrorCode } from "../errors";
import {
    getFee,
    getPostingMode,
    getStorageAddress,
    getWeb3,
    PostingMode,
    setFee,
} from "../state";
import type {
    BatchedSubunit,
    BatcherPostResponse,
    BatcherTrackResponse,
    Result,
} from "../types";
import { batchedToJsonString, buildBatchedSubunit } from "./data-processing";
import { batcherEndpointCall, postToBatcher } from "./server-interaction";
import { signMessageCardano } from "./wallet-cardano";
import { signMessageEth } from "./wallet-metamask";

const BATCHER_WAIT_PERIOD = 500;
const BATCHER_RETRIES = 50;

const TX_VERIFICATION_DELAY = 5000;

export async function updateFee() {
    try {
        let web3 = await getWeb3();
        const newFee = await retrieveFee(getStorageAddress(), web3);
        setFee(newFee);
        console.log(
            `[updateFee] retrieved fee ${newFee}, ${newFee.length} symbols`
        );
    } catch (err) {
        console.log("[updateFee] error while updating fee:", err);
    }
}

// On success returns the block number of the transaction.
export async function postConciselyEncodedData(
    userAddress: string,
    methodName: string,
    values: string[]
): Promise<Result<number>> {
    const errorFxn = buildEndpointErrorFxn("postConciselyEncodedData");
    const gameInput = values.join("|");
    const postingMode = getPostingMode();

    switch (postingMode) {
        case PostingMode.UNBATCHED:
            return postString(userAddress, methodName, gameInput);
        case PostingMode.BATCHED_ETH:
            return buildBatchedSubunit(
                signMessageEth,
                userAddress,
                gameInput
            ).then(submitToBatcher);
        case PostingMode.BATCHED_CARDANO:
            return buildBatchedSubunit(
                signMessageCardano,
                userAddress,
                gameInput
            ).then(submitToBatcher);
        default:
            return errorFxn(
                CatapultMiddlewareErrorCode.INTERNAL_INVALID_POSTING_MODE,
                `Invalid posting mode: ${postingMode}`
            );
    }
}

export async function postString(
    userAddress: string,
    methodName: string,
    dataUtf8: string
): Promise<Result<number>> {
    const errorFxn = buildEndpointErrorFxn("postString");
    const hexData = utf8ToHex(dataUtf8);
    const txTemplate = getTxTemplate(getStorageAddress(), methodName, hexData);
    const tx = {
        ...txTemplate,
        from: userAddress,
        value: numberToHex(getFee()),
    };

    try {
        const txHash = await (window as any).ethereum.request({
            method: "eth_sendTransaction",
            params: [tx],
        });
        return verifyTx(txHash, TX_VERIFICATION_DELAY);
    } catch (err) {
        return errorFxn(
            CatapultMiddlewareErrorCode.ERROR_POSTING_TO_CHAIN,
            err
        );
    }
}

// Verifies that the transaction took place and returns its block number on success
async function verifyTx(
    txHash: string,
    msTimeout: number
): Promise<Result<number>> {
    return new Promise((res, err) => {
        setTimeout(async () => {
            const web3 = await getWeb3();
            web3.eth
                .getTransactionReceipt(txHash)
                .then(receipt =>
                    res({
                        success: true,
                        result: receipt.blockNumber,
                    })
                )
                .catch((error: any) => err(Error(error.message)));
        }, msTimeout);
    });
}

export async function submitToBatcher(
    subunit: BatchedSubunit
): Promise<Result<number>> {
    const errorFxn = buildEndpointErrorFxn("submitToBatcher");
    const body = batchedToJsonString(subunit);

    let response: BatcherPostResponse;
    let hash: string;

    try {
        const result = await postToBatcher("submit_user_input", body);
        if (!result.success) {
            return errorFxn(
                CatapultMiddlewareErrorCode.ERROR_POSTING_TO_BATCHER
            );
        }
        // TODO: verify?
        response = result.result as BatcherPostResponse;
    } catch (err) {
        return errorFxn(CatapultMiddlewareErrorCode.ERROR_POSTING_TO_BATCHER);
    }

    try {
        if (!response.success) {
            const msg = `Batcher rejected input "${body}" with response "${response.message}"`;
            return errorFxn(
                CatapultMiddlewareErrorCode.BATCHER_REJECTED_INPUT,
                msg
            );
        }
        hash = response.hash;
    } catch (err) {
        return errorFxn(
            CatapultMiddlewareErrorCode.INVALID_RESPONSE_FROM_BATCHER,
            err
        );
    }

    try {
        for (let i = 0; i < BATCHER_RETRIES; i++) {
            await wait(BATCHER_WAIT_PERIOD);
            //console.log(`[submitToBatcher] tracking data, attempt ${i + 1}`);
            const result = await batcherEndpointCall(
                `track_user_input?input_hash=${hash}`
            );
            if (!result.success) {
                continue;
            }
            // TODO: verify?
            const status: BatcherTrackResponse =
                result.result as BatcherTrackResponse;
            if (status.status === "rejected") {
                const msg = `Batcher rejected input "${body}" with response "${status.message}"`;
                return errorFxn(
                    CatapultMiddlewareErrorCode.BATCHER_REJECTED_INPUT,
                    msg
                );
            } else if (status.status === "posted") {
                return {
                    success: true,
                    result: status.block_height,
                };
            }
        }
        return errorFxn(
            CatapultMiddlewareErrorCode.FAILURE_VERIFYING_BATCHER_ACCEPTANCE
        );
    } catch (err) {
        return errorFxn(
            CatapultMiddlewareErrorCode.FAILURE_VERIFYING_BATCHER_ACCEPTANCE,
            err
        );
    }
}
