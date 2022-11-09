import {
    BACKEND_URI,
    BATCHER_URI,
    CardanoAddress,
    CHAIN_ID,
    CHAIN_NAME,
    CHAIN_URI,
    ContractAddress,
    DEFAULT_FEE,
    DEPLOYMENT,
    EthAddress,
    INDEXER_URI,
    STORAGE_ADDRESS,
    URI,
} from "@tower-defense/utils";
import type { ETHAddress, Web3 } from "paima-engine/paima-utils";
import { initWeb3 } from "paima-engine/paima-utils";
import { CatapultMiddlewareErrorCode, errorMessageFxn } from "./errors";
import type {
    CardanoApi,
    Deployment,
    MiddlewareConnectionDetails,
    PostingInfo,
    PostingModeString,
} from "./types";

export const enum PostingMode {
    UNBATCHED,
    BATCHED_ETH,
    BATCHED_CARDANO,
}

export const POSTING_MODE_NAMES: { [key: number]: PostingModeString } = {
    [PostingMode.UNBATCHED]: "unbatched",
    [PostingMode.BATCHED_ETH]: "batched-eth",
    [PostingMode.BATCHED_CARDANO]: "batched-cardano",
};

const backendUri: URI = BACKEND_URI;
const indexerUri: URI = INDEXER_URI;
const batcherUri: URI = BATCHER_URI;

const chainUri: URI = CHAIN_URI;
const chainId: number = CHAIN_ID;
const chainName: string = CHAIN_NAME;

const storageAddress: ContractAddress = STORAGE_ADDRESS;

const deployment: Deployment = DEPLOYMENT;

let postingMode: PostingMode = PostingMode.UNBATCHED;

let ethAddress: EthAddress = "";
let cardanoAddress: CardanoAddress = "";
let cardanoApi: CardanoApi = undefined;

let web3: Web3 | undefined = undefined;
let fee: string = DEFAULT_FEE;

export const getBackendUri = (): URI => backendUri;
export const getIndexerUri = (): URI => indexerUri;
export const getBatcherUri = (): URI => batcherUri;

export const getChainUri = (): URI => chainUri;
export const getChainId = (): number => chainId;
export const getChainName = (): string => chainName;

export const getStorageAddress = (): ContractAddress => storageAddress;

export const getDeployment = (): Deployment => deployment;

export const getPostingMode = (): PostingMode => postingMode;
export const getPostingModeString = (): PostingModeString =>
    POSTING_MODE_NAMES[postingMode];
const setPostingMode = (newMode: PostingMode) => (postingMode = newMode);
export const setUnbatchedMode = () => setPostingMode(PostingMode.UNBATCHED);
export const setBatchedEthMode = () => setPostingMode(PostingMode.BATCHED_ETH);
export const setBatchedCardanoMode = () =>
    setPostingMode(PostingMode.BATCHED_CARDANO);

export const setEthAddress = (addr: ETHAddress) => (ethAddress = addr);
export const getEthAddress = (): EthAddress => ethAddress;
export const ethConnected = (): boolean => ethAddress !== "";

export const setCardanoAddress = (addr: CardanoAddress) =>
    (cardanoAddress = addr);
export const getCardanoAddress = (): CardanoAddress => cardanoAddress;
export const cardanoConnected = (): boolean => cardanoAddress !== "";

export const setCardanoApi = (api: CardanoApi) => (cardanoApi = api);
export const getCardanoApi = (): CardanoApi => cardanoApi;

export const setFee = (newFee: string) => (fee = newFee);
export const getFee = (): string => fee;

export const getWeb3 = async (): Promise<Web3> => {
    if (typeof web3 === "undefined") {
        web3 = await initWeb3(chainUri);
    }
    return web3;
};

export const getActiveAddress = (): string => {
    switch (postingMode) {
        case PostingMode.UNBATCHED:
        case PostingMode.BATCHED_ETH:
            return ethAddress;
        case PostingMode.BATCHED_CARDANO:
            return cardanoAddress;
        default:
            const errorCode =
                CatapultMiddlewareErrorCode.INTERNAL_INVALID_POSTING_MODE;
            throw new Error(errorMessageFxn(errorCode));
    }
};

export const getConnectionDetails = (): MiddlewareConnectionDetails => ({
    storageAddress,
    backendUri,
    indexerUri,
    batcherUri,
});

export const getPostingInfo = (): PostingInfo => ({
    address: getActiveAddress(),
    postingModeString: getPostingModeString(),
});
