import verifyCardanoDataSignature from "@cardano-foundation/cardano-verify-datasignature";

export function validateCardanoAddress(address: string): boolean {
    return /^[0-9a-z_]+$/.test(address);
}

export async function verifySignatureCardano(
    userAddress: string,
    message: string,
    signedMessage: string
): Promise<boolean> {
    try {
        const [signature, key, ...remainder] = signedMessage.split("+");
        if (!signature || !key || remainder.length > 0) {
            return false;
        }
        return verifyCardanoDataSignature(signature, key, message, userAddress);
    } catch (err) {
        console.log(
            "[address-validator] error verifying cardano signature:",
            err
        );
        return false;
    }
}