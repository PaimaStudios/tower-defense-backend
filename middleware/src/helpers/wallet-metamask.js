import { utf8ToHex } from "web3-utils";
import { buildEndpointErrorFxn } from "../errors";
import { getChainId, getChainName, getChainUri } from "../state";
export async function rawWalletLogin() {
    const accounts = (await window.ethereum.request({
        method: "eth_requestAccounts",
    }));
    if (!accounts || accounts.length === 0) {
        throw new Error("Unknown error while receiving accounts");
    }
    return accounts[0];
}
export async function switchChain() {
    const errorFxn = buildEndpointErrorFxn("switchChain");
    const CHAIN_NOT_ADDED_ERROR_CODE = 4902;
    const hexChainId = "0x" + getChainId().toString(16);
    try {
        await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: hexChainId }],
        });
    }
    catch (switchError) {
        // This error code indicates that the chain has not been added to MetaMask.
        const se = switchError;
        if (se.hasOwnProperty("code") &&
            se.code === CHAIN_NOT_ADDED_ERROR_CODE) {
            try {
                await window.ethereum.request({
                    method: "wallet_addEthereumChain",
                    params: [
                        {
                            chainId: hexChainId,
                            chainName: getChainName(),
                            rpcUrls: [getChainUri()],
                        },
                    ],
                });
                return true;
            }
            catch (addError) {
                errorFxn(8 /* CatapultMiddlewareErrorCode.ERROR_ADDING_CHAIN */, addError);
                return false;
            }
        }
        else {
            errorFxn(7 /* CatapultMiddlewareErrorCode.ERROR_SWITCHING_TO_CHAIN */, switchError);
            return false;
        }
    }
    return true;
}
export async function verifyWalletChain() {
    try {
        return window.ethereum
            .request({ method: "eth_chainId" })
            .then(res => parseInt(res) === getChainId());
    }
    catch (e) {
        console.error(e);
        return false;
    }
}
export async function signMessageEth(userAddress, message) {
    const hexMessage = utf8ToHex(message);
    return window.ethereum.request({
        method: "personal_sign",
        params: [hexMessage, userAddress, ""],
    });
}
