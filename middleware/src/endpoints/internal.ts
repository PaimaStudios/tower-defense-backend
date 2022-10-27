import { gameBackendVersion } from "td-utils";
import { buildEndpointErrorFxn, CatapultMiddlewareErrorCode } from "../errors";
import { cardanoLogin } from "../helpers/wallet-cardano";
import { rawWalletLogin } from "../helpers/wallet-metamask";
import {
    getCardanoAddress,
    getConnectionDetails,
    getPostingInfo,
    setBatchedCardanoMode,
    setBatchedEthMode,
    setEthAddress,
    setUnbatchedMode,
} from "../state";
import {
    FailedResult,
    MiddlewareConfig,
    PostingModeSwitchResult,
    Wallet,
} from "../types";

export function getMiddlewareConfig(): MiddlewareConfig {
    return {
        ...getConnectionDetails(),
        localVersion: gameBackendVersion,
    };
}

export async function userWalletLoginWithoutChecks(): Promise<
    Wallet | FailedResult
> {
    const errorFxn = buildEndpointErrorFxn("userWalletLoginWithoutChecks");
    let account: string;
    try {
        account = await rawWalletLogin();
    } catch (err) {
        return errorFxn(CatapultMiddlewareErrorCode.METAMASK_LOGIN);
    }
    const userWalletAddress = account;

    setEthAddress(userWalletAddress);
    return {
        success: true,
        walletAddress: userWalletAddress,
    };
}

export async function cardanoWalletLoginEndpoint(): Promise<
    Wallet | FailedResult
> {
    const errorFxn = buildEndpointErrorFxn("cardanoWalletLoginEndpoint");
    try {
        await cardanoLogin();
        return {
            success: true,
            walletAddress: getCardanoAddress(),
        };
    } catch (err) {
        return errorFxn(CatapultMiddlewareErrorCode.CARDANO_LOGIN);
    }
}

export async function switchToUnbatchedMode(): Promise<PostingModeSwitchResult> {
    setUnbatchedMode();
    return {
        success: true,
        ...getPostingInfo(),
    };
}

export async function switchToBatchedEthMode(): Promise<PostingModeSwitchResult> {
    setBatchedEthMode();
    return {
        success: true,
        ...getPostingInfo(),
    };
}

export async function switchToBatchedCardanoMode(): Promise<PostingModeSwitchResult> {
    setBatchedCardanoMode();
    return {
        success: true,
        ...getPostingInfo(),
    };
}
