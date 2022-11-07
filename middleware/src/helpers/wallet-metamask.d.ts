import { MetaMaskInpageProvider } from "@metamask/providers";
export interface Window {
    ethereum: MetaMaskInpageProvider;
}
export declare function rawWalletLogin(): Promise<string>;
export declare function switchChain(): Promise<boolean>;
export declare function verifyWalletChain(): Promise<boolean>;
export declare function signMessageEth(userAddress: string, message: string): Promise<string>;
