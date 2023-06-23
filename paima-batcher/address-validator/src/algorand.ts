import type { Transaction, SignedTransaction, SuggestedParams } from "algosdk";
import algosdk, { makePaymentTxnWithSuggestedParams } from "algosdk";
import web3UtilsPkg from 'web3-utils';
import nacl from "tweetnacl";

import { hexStringToUint8Array } from "@paima-batcher/utils";

const { utf8ToHex } = web3UtilsPkg;

export function validateAlgorandAddress(address: string): boolean {
    return /^[0-9a-zA-Z]+$/.test(address);
}

export function verifySignatureAlgorand(
    userAddress: string,
    message: string,
    signature: string
): boolean {
    try {
        const sig = Buffer.from(hexStringToUint8Array(signature));
        const txn = buildTransaction(userAddress, message);
        const signedTx: SignedTransaction = {
            txn,
            sig
        };
        return verifySignedTransaction(signedTx);
    } catch (err) {
        console.log(
            "[address-validator] error verifying algorand signature:",
            err
        );
        return false;
    }
}

function verifySignedTransaction(signedTransaction: SignedTransaction): boolean {
    if (signedTransaction.sig === undefined) return false;
  
    const pkBytes = signedTransaction.txn.from.publicKey;
  
    const signatureBytes = new Uint8Array(signedTransaction.sig);
  
    const transactionBytes = algosdk.encodeObj(signedTransaction.txn.get_obj_for_encoding());
    const messageBytes = new Uint8Array(transactionBytes.length + 2);
    messageBytes.set(Buffer.from("TX"));
    messageBytes.set(transactionBytes, 2);
  
    return nacl.sign.detached.verify(messageBytes, signatureBytes, pkBytes);
}

function buildTransaction(
    userAddress: string,
    message: string
): Transaction {
    const hexMessage = utf8ToHex(message).slice(2);
    const msgArray = hexStringToUint8Array(hexMessage);
    const SUGGESTED_PARAMS: SuggestedParams = {
        fee: 0,
        firstRound: 10,
        lastRound: 10,
        genesisID: "mainnet-v1.0",
        genesisHash: "wGHE2Pwdvd7S12BL5FaOP20EGYesN73ktiC1qzkkit8="
    };
    return makePaymentTxnWithSuggestedParams(userAddress, userAddress, 0, userAddress, msgArray, SUGGESTED_PARAMS);
}