import Web3 from "web3";

export function validateEthereumAddress(address: string): boolean {
    return /^0x[0-9A-Fa-f]+$/.test(address);
}

export function verifySignatureEthereum(
    web3: Web3,
    message: string,
    userAddress: string,
    userSignature: string
): boolean {
    try {
        const recoveredAddr = web3.eth.accounts.recover(message, userSignature);
        return recoveredAddr.toLowerCase() === userAddress.toLowerCase();
    } catch (err) {
        console.log(
            "[address-validator] error verifying cardano signature:",
            err
        );
        return false;
    }
}