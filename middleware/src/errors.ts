import {
    buildErrorCodeTranslator,
    ErrorCode,
    ErrorMessageFxn,
    ErrorMessageMapping,
} from "paima-engine/paima-utils";
import type { FailedResult } from "./types";

type EndpointErrorFxn = (errorCode: ErrorCode, err?: any) => FailedResult;

export const enum CatapultMiddlewareErrorCode {
    OK,
    UNKNOWN,
    // Account related:
    METAMASK_LOGIN,
    METAMASK_CHAIN_SWITCH,
    BACKEND_VERSION_INCOMPATIBLE,
    ERROR_UPDATING_FEE,
    WALLET_NOT_CONNECTED,
    ERROR_SWITCHING_TO_CHAIN,
    ERROR_ADDING_CHAIN,
    CARDANO_LOGIN,
    // Input posting related:
    ERROR_POSTING_TO_CHAIN,
    ERROR_POSTING_TO_BATCHER,
    BATCHER_REJECTED_INPUT,
    INVALID_RESPONSE_FROM_BATCHER,
    FAILURE_VERIFYING_BATCHER_ACCEPTANCE,
    // Query endpoint related:
    ERROR_QUERYING_BACKEND_ENDPOINT,
    ERROR_QUERYING_INDEXER_ENDPOINT,
    INVALID_RESPONSE_FROM_BACKEND,
    INVALID_RESPONSE_FROM_INDEXER,
    CALCULATED_ROUND_END_IN_PAST,
    UNABLE_TO_BUILD_EXECUTOR,
    NO_REGISTERED_NFT,
    UNABLE_TO_VERIFY_NFT_OWNERSHIP,
    NFT_OWNED_BY_DIFFERENT_ADDRESS,
    NFT_TITLE_IMAGE_UNKNOWN,
    NO_OPEN_LOBBIES,
    RANDOM_OPEN_LOBBY_FALLBACK,
    // Write endpoint related:
    FAILURE_VERIFYING_LOBBY_CREATION,
    FAILURE_VERIFYING_LOBBY_JOIN,
    CANNOT_JOIN_OWN_LOBBY,
    SUBMIT_MOVES_EXACTLY_3,
    SUBMIT_MOVES_INVALID_MOVES,
    // Internal, should never occur:
    INTERNAL_INVALID_DEPLOYMENT,
    INTERNAL_INVALID_POSTING_MODE,
}

const CATAPULT_MIDDLEWARE_ERROR_MESSAGES: ErrorMessageMapping = {
    [CatapultMiddlewareErrorCode.OK]: "",
    [CatapultMiddlewareErrorCode.UNKNOWN]: "Unknown error",
    [CatapultMiddlewareErrorCode.METAMASK_LOGIN]: "Unable to log into Metamask",
    [CatapultMiddlewareErrorCode.METAMASK_CHAIN_SWITCH]:
        "Error while switching Metamask chain",
    [CatapultMiddlewareErrorCode.BACKEND_VERSION_INCOMPATIBLE]:
        "Backend version incompatible with middleware version",
    [CatapultMiddlewareErrorCode.ERROR_UPDATING_FEE]: "Error updating fee",
    [CatapultMiddlewareErrorCode.WALLET_NOT_CONNECTED]:
        "The user wallet has not yet been connected",
    [CatapultMiddlewareErrorCode.ERROR_SWITCHING_TO_CHAIN]:
        "Error while switching wallet to target chain",
    [CatapultMiddlewareErrorCode.ERROR_ADDING_CHAIN]:
        "Error while adding target chain to wallet",
    [CatapultMiddlewareErrorCode.CARDANO_LOGIN]:
        "Error while connecting to the Cardano wallet",
    [CatapultMiddlewareErrorCode.ERROR_POSTING_TO_CHAIN]:
        "An error occured while posting data to the blockchain",
    [CatapultMiddlewareErrorCode.ERROR_POSTING_TO_BATCHER]:
        "An error occured while posting data to the batcher",
    [CatapultMiddlewareErrorCode.BATCHER_REJECTED_INPUT]:
        "The input was not accepted by the batcher",
    [CatapultMiddlewareErrorCode.INVALID_RESPONSE_FROM_BATCHER]:
        "Invalid response received from batcher",
    [CatapultMiddlewareErrorCode.FAILURE_VERIFYING_BATCHER_ACCEPTANCE]:
        "Failure verifying if the input was accepted by the batcher",
    [CatapultMiddlewareErrorCode.ERROR_QUERYING_BACKEND_ENDPOINT]:
        "An error occured while querying a backend endpoint",
    [CatapultMiddlewareErrorCode.ERROR_QUERYING_INDEXER_ENDPOINT]:
        "An error occured while querying an indexer endpoint",
    [CatapultMiddlewareErrorCode.INVALID_RESPONSE_FROM_BACKEND]:
        "Invalid response received from the backend",
    [CatapultMiddlewareErrorCode.INVALID_RESPONSE_FROM_INDEXER]:
        "Invalid response received from the indexer",
    [CatapultMiddlewareErrorCode.CALCULATED_ROUND_END_IN_PAST]:
        "Calculated round end is in the past",
    [CatapultMiddlewareErrorCode.UNABLE_TO_BUILD_EXECUTOR]:
        "Unable to build executor from data returned from server -- executor might not exist",
    [CatapultMiddlewareErrorCode.NO_REGISTERED_NFT]:
        "No NFT registered with the backend",
    [CatapultMiddlewareErrorCode.UNABLE_TO_VERIFY_NFT_OWNERSHIP]:
        "Unable to verify NFT ownership",
    [CatapultMiddlewareErrorCode.NFT_OWNED_BY_DIFFERENT_ADDRESS]:
        "Registered NFT is owned by different address",
    [CatapultMiddlewareErrorCode.NFT_TITLE_IMAGE_UNKNOWN]:
        "Indexer unable to find title and image of registered NFT",
    [CatapultMiddlewareErrorCode.NO_OPEN_LOBBIES]:
        "No open lobbies were found, please try again later",
    [CatapultMiddlewareErrorCode.RANDOM_OPEN_LOBBY_FALLBACK]:
        "getRandomOpenLobby returned no lobby, falling back on getOpenLobbies",
    [CatapultMiddlewareErrorCode.FAILURE_VERIFYING_LOBBY_CREATION]:
        "Failure while verifying lobby creation",
    [CatapultMiddlewareErrorCode.FAILURE_VERIFYING_LOBBY_JOIN]:
        "Failure while verifying lobby join",
    [CatapultMiddlewareErrorCode.CANNOT_JOIN_OWN_LOBBY]:
        "Cannot join your own lobby",
    [CatapultMiddlewareErrorCode.SUBMIT_MOVES_EXACTLY_3]:
        "Exactly three moves must be submitted",
    [CatapultMiddlewareErrorCode.SUBMIT_MOVES_INVALID_MOVES]:
        "One or more invalid moves submitted",
    [CatapultMiddlewareErrorCode.INTERNAL_INVALID_DEPLOYMENT]:
        "Internal error: Invalid deployment set",
    [CatapultMiddlewareErrorCode.INTERNAL_INVALID_POSTING_MODE]:
        "Internal error: Invalid posting mode set",
};

export const errorMessageFxn: ErrorMessageFxn = buildErrorCodeTranslator(
    CATAPULT_MIDDLEWARE_ERROR_MESSAGES
);

export function buildEndpointErrorFxn(endpointName: string): EndpointErrorFxn {
    return function (errorCode: ErrorCode, err?: any) {
        const errorOccured = errorCode !== 0;
        const msg: string = errorMessageFxn(errorCode);

        if (errorOccured) {
            console.log(`[${endpointName}] ${msg}`);
        }
        if (typeof err !== "undefined") {
            console.log(`[${endpointName}] error:`, err);
        }
        return {
            success: false,
            message: msg,
        };
    };
}
