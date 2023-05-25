import Web3 from "web3";
import type { Contract } from "web3-eth-contract";
import type { AbiItem } from "web3-utils";
import HDWalletProvider from "@truffle/hdwallet-provider";

import {
    GameInputValidatorCore,
    ErrorCode,
    ErrorMessageFxn,
    UserInput,
} from "./types.js";
import { GenericRejectionCode, GameInputValidatorCoreType } from "./types.js";
import { AddressType } from "./constants.js";
import { VERSION_STRING } from "./version.js";

import storageBuild from "./artifacts/Storage.js";

import web3Utils from "web3-utils";
const { sha3 } = web3Utils;

export let keepRunning: boolean;

export function requestStop() {
    keepRunning = false;
}

export function requestStart() {
    keepRunning = true;
}

export let gameInputValidatorClosed: boolean;
export let webserverClosed: boolean;

export function unsetGameInputValidatorClosed() {
    gameInputValidatorClosed = false;
}

export function setGameInputValidatorClosed() {
    gameInputValidatorClosed = true;
}

export function unsetWebserverClosed() {
    webserverClosed = false;
}

export function setWebserverClosed() {
    webserverClosed = true;
}

export type { GameInputValidatorCore, ErrorCode, ErrorMessageFxn, UserInput };
export { GenericRejectionCode, AddressType, GameInputValidatorCoreType, VERSION_STRING };

export const OUTER_DIVIDER = "\x02";
export const INNER_DIVIDER = "\x03";

export const CHAIN_URI = process.env.CHAIN_URI || "";
export const STORAGE_CONTRACT_ADDRESS = process.env.STORAGE_CONTRACT_ADDRESS || "";
export const DEFAULT_FEE = process.env.DEFAULT_FEE || "";

export const TOWER_DEFENSE_BACKEND_URI = process.env.TOWER_DEFENSE_BACKEND_URI || "";

export const GAME_INPUT_VALIDATOR_PERIOD = parseInt(process.env.GAME_INPUT_VALIDATOR_PERIOD || "0", 10);
export const BATCHED_TRANSACTION_POSTER_PERIOD = parseInt(process.env.BATCHED_TRANSACTION_POSTER_PERIOD || "0", 10);
export const BATCHED_MESSAGE_SIZE_LIMIT = parseInt(process.env.BATCHED_MESSAGE_SIZE_LIMIT || "0", 10);

export const MAX_USER_INPUTS_PER_MINUTE = parseInt(process.env.MAX_USER_INPUTS_PER_MINUTE || "0", 10);
export const MAX_USER_INPUTS_PER_DAY = parseInt(process.env.MAX_USER_INPUTS_PER_DAY || "0", 10);

export const BATCHER_PORT = parseInt(process.env.BATCHER_PORT || "0", 10);

export const BATCHER_PRIVATE_KEY = process.env.BATCHER_PRIVATE_KEY || "";

export const GAME_INPUT_VALIDATION_TYPE_NAME = process.env.GAME_INPUT_VALIDATION_TYPE_NAME || "no-validation";
export const GAME_INPUT_VALIDATION_TYPE = getGameInputValidatorType(GAME_INPUT_VALIDATION_TYPE_NAME);

export const GENERIC_ERROR_MESSAGES = {
    [GenericRejectionCode.UNSUPPORTED_ADDRESS_TYPE]:
        "The user address is of an unknown or unsupported format",
    [GenericRejectionCode.INVALID_ADDRESS]: "The user address is invalid",
    [GenericRejectionCode.INVALID_SIGNATURE]:
        "The supplied signature is invalid",
    [GenericRejectionCode.ADDRESS_NOT_ALLOWED]:
        "The user address is not allowed to submit inputs",
    [GenericRejectionCode.INVALID_GAME_INPUT]: "The game input is invalid",
};

export const SUPPORTED_CHAIN_NAMES: string[] = [
    addressTypeName(AddressType.EVM),
    addressTypeName(AddressType.POLKADOT),
    addressTypeName(AddressType.CARDANO)
];

const POLLING_INTERVAL = 10000;

const hashFxn = (s: string) => sha3(s) || "0x0";

export function hashInput(input: UserInput) {
    return hashFxn(
        input.userAddress + input.gameInput + input.millisecondTimestamp
    );
}

export function packInput(input: UserInput) {
    return [
        input.addressType.toString(10),
        input.userAddress,
        input.userSignature,
        input.gameInput,
        input.millisecondTimestamp,
    ].join(INNER_DIVIDER);
}

export function addressTypeName(addressType: AddressType): string {
    switch (addressType) {
        case AddressType.EVM:
            return "EVM"
        case AddressType.CARDANO:
            return "Cardano"
        case AddressType.POLKADOT:
            return "Astar / Polkadot"
        default:
            return "Unknown address type";
    }
}

export async function getAndConfirmWeb3(
    nodeUrl: string,
    privateKey: string,
    retryPeriodMs: number
): Promise<Web3> {
    while (true) {
        try {
            const [web3, _] = await getWalletWeb3AndAddress(nodeUrl, privateKey);
            await web3.eth.getBlockNumber();
            return web3;
        } catch (err) {
            console.log("Unable to reinitialize web3:", err);
            console.log(`Retrying in ${retryPeriodMs} ms...`);
            await wait(retryPeriodMs);
        }
    }
}

export async function getWalletWeb3AndAddress(
    nodeUrl: string,
    privateKey: string
): Promise<[Web3, string]> {

    // retyping to any seems to be needed because initialize is private
    const origInit = (HDWalletProvider.prototype as any).initialize;
    (HDWalletProvider.prototype as any).initialize = async function () {
		while (true) {
			try {
				return await origInit.call(this);
			} catch (e) {
				console.log("origInit failed");
				console.log(e);
			}
			await wait(1000);
		}
	};


    const wallet = new HDWalletProvider({
        privateKeys: [privateKey],
        providerOrUrl: nodeUrl,
        pollingInterval: POLLING_INTERVAL
    });
    (wallet.engine as any)._blockTracker.on('error', (err: any) => {
		console.log('BlockTracker error', err);
	});
    (wallet.engine as any).on('error', (err: any) => {
		console.log('Web3ProviderEngine error', err);
	});
    // The <any> below seems to be required as there seems to be some type mismatch
    // since a newer version of HDWalletProvider / Web3
    const web3 = new Web3(<any>wallet);
    return [web3, wallet.getAddress()];
}

export async function getWeb3(nodeUrl: string): Promise<Web3> {
    const web3 = new Web3(nodeUrl);
    try {
        await web3.eth.getNodeInfo();
    } catch (e) {
        throw new Error(`Error connecting to node at ${nodeUrl}:\n${e}`);
    }
    return web3;
}

export function getStorageContract(web3: Web3, address: string): Contract {
    return new web3.eth.Contract(storageBuild.abi as AbiItem[], address);
}

export function getGameInputValidatorType(typeString: string): GameInputValidatorCoreType {
    switch (typeString) {
        case "tower-defense":
            return GameInputValidatorCoreType.TOWER_DEFENSE;
        case "no-validation":
        default:
            return GameInputValidatorCoreType.NO_VALIDATION;
    }
}

export const wait = async (ms: number): Promise<void> =>
  await new Promise<void>(resolve => {
    setTimeout(() => resolve(), ms);
  });
