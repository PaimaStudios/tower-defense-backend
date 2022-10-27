import { buildEndpointErrorFxn, CatapultMiddlewareErrorCode } from "../errors";
import { localRemoteVersionsCompatible } from "../helpers/auxiliary-queries";
import { updateFee } from "../helpers/contract-interaction";
import {
    rawWalletLogin,
    switchChain,
    verifyWalletChain as verifyWalletChainInternal,
} from "../helpers/wallet-metamask";
import { setEthAddress } from "../state";
import { FailedResult, Wallet } from "../types";

async function verifyWalletChain(): Promise<boolean> {
    return verifyWalletChainInternal();
}

async function userWalletLogin(): Promise<Wallet | FailedResult> {
    const errorFxn = buildEndpointErrorFxn("userWalletLogin");
    let account: string;
    try {
        account = await rawWalletLogin();
    } catch (err) {
        return errorFxn(CatapultMiddlewareErrorCode.METAMASK_LOGIN);
    }
    const userWalletAddress = account;

    try {
        await updateFee();
    } catch (err) {
        errorFxn(CatapultMiddlewareErrorCode.ERROR_UPDATING_FEE, err);
        // The fee has a default value, so this is not fatal and we can continue.
        // If the fee has increased beyond the default value, posting won't work.
    }
    try {
        if (!(await verifyWalletChain())) {
            await switchChain();
        }
    } catch (err) {
        return errorFxn(CatapultMiddlewareErrorCode.METAMASK_CHAIN_SWITCH, err);
    }

    if (!(await localRemoteVersionsCompatible())) {
        return errorFxn(
            CatapultMiddlewareErrorCode.BACKEND_VERSION_INCOMPATIBLE
        );
    }

    setEthAddress(userWalletAddress);
    return {
        success: true,
        walletAddress: userWalletAddress,
    };
}

export const accountsEndpoints = {
    userWalletLogin,
    verifyWalletChain,
};
