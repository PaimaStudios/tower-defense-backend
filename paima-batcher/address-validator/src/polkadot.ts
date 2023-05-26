import { decodeAddress, signatureVerify } from '@polkadot/util-crypto';
import { u8aToHex } from '@polkadot/util';

export function validatePolkadotAddress(address: string): boolean {
    return /^[0-9a-zA-Z]+$/.test(address);
}

export async function verifySignaturePolkadot(
    userAddress: string,
    message: string,
    signedMessage: string
): Promise<boolean> {
    try {
        const publicKey = decodeAddress(userAddress);
        const hexPublicKey = u8aToHex(publicKey);
        return signatureVerify(message, signedMessage, hexPublicKey).isValid;
    } catch (err) {
        console.log(
            "[address-validator] error verifying polkadot signature:",
            err
        );
        return false;
    }
}