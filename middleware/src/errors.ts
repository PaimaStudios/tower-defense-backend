import type { FailedResult } from 'paima-engine/paima-mw-core';
import {
  PaimaMiddlewareErrorCode,
  buildAbstractEndpointErrorFxn,
  PAIMA_MIDDLEWARE_ERROR_MESSAGES,
} from 'paima-engine/paima-mw-core';
import type { ErrorCode, ErrorMessageFxn } from 'paima-engine/paima-utils';
import { buildErrorCodeTranslator } from 'paima-engine/paima-utils';

export type EndpointErrorFxn = (
  errorDescription: ErrorCode | string,
  err?: any,
  errorCode?: number
) => FailedResult;

type CatapultErrorMessageMapping = Record<MiddlewareErrorCode, string>;

export const FE_ERR_OK = 0;
export const FE_ERR_GENERIC = 1;
export const FE_ERR_METAMASK_NOT_INSTALLED = 2;

export { PaimaMiddlewareErrorCode };

export const enum MiddlewareErrorCode {
  GENERIC_CATAPULT_ERROR = PaimaMiddlewareErrorCode.FINAL_PAIMA_GENERIC_ERROR + 1,
  // Query endpoint related:
  ERROR_QUERYING_INDEXER_ENDPOINT,
  ERROR_QUERYING_STATEFUL_ENDPOINT,
  INVALID_RESPONSE_FROM_INDEXER,
  INVALID_RESPONSE_FROM_STATEFUL,
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
  FAILURE_VERIFYING_LOBBY_CLOSE,
  FAILURE_VERIFYING_LOBBY_JOIN,
  CANNOT_JOIN_OWN_LOBBY,
  CANNOT_CLOSE_SOMEONES_LOBBY,
  SUBMIT_MOVES_EXACTLY_3,
  SUBMIT_MOVES_INVALID_MOVES,
  // Internal, should never occur:
  INTERNAL_INVALID_DEPLOYMENT,
  INTERNAL_INVALID_POSTING_MODE,
}

const CATAPULT_MIDDLEWARE_ERROR_MESSAGES: CatapultErrorMessageMapping = {
  [MiddlewareErrorCode.GENERIC_CATAPULT_ERROR]: 'Unspecified generit Catapult error',
  [MiddlewareErrorCode.ERROR_QUERYING_INDEXER_ENDPOINT]:
    'An error occured while querying an NFT indexer endpoint',
  [MiddlewareErrorCode.ERROR_QUERYING_STATEFUL_ENDPOINT]:
    'An error occured while querying a stateful indexer endpoint',
  [MiddlewareErrorCode.INVALID_RESPONSE_FROM_INDEXER]:
    'Invalid response received from the NFT indexer',
  [MiddlewareErrorCode.INVALID_RESPONSE_FROM_STATEFUL]:
    'Invalid response received from the stateful indexer',
  [MiddlewareErrorCode.CALCULATED_ROUND_END_IN_PAST]: 'Calculated round end is in the past',
  [MiddlewareErrorCode.UNABLE_TO_BUILD_EXECUTOR]:
    'Unable to build executor from data returned from server -- executor might not exist',
  [MiddlewareErrorCode.NO_REGISTERED_NFT]: 'No NFT registered with the backend',
  [MiddlewareErrorCode.UNABLE_TO_VERIFY_NFT_OWNERSHIP]: 'Unable to verify NFT ownership',
  [MiddlewareErrorCode.NFT_OWNED_BY_DIFFERENT_ADDRESS]:
    'Registered NFT is owned by different address',
  [MiddlewareErrorCode.NFT_TITLE_IMAGE_UNKNOWN]:
    'Indexer unable to find title and image of registered NFT',
  [MiddlewareErrorCode.NO_OPEN_LOBBIES]: 'No open lobbies were found, please try again later',
  [MiddlewareErrorCode.RANDOM_OPEN_LOBBY_FALLBACK]:
    'getRandomOpenLobby returned no lobby, falling back on getOpenLobbies',
  [MiddlewareErrorCode.FAILURE_VERIFYING_LOBBY_CREATION]: 'Failure while verifying lobby creation',
  [MiddlewareErrorCode.FAILURE_VERIFYING_LOBBY_CLOSE]: 'Failure while verifying lobby closing',
  [MiddlewareErrorCode.FAILURE_VERIFYING_LOBBY_JOIN]: 'Failure while verifying lobby join',
  [MiddlewareErrorCode.CANNOT_JOIN_OWN_LOBBY]: 'Cannot join your own lobby',
  [MiddlewareErrorCode.CANNOT_CLOSE_SOMEONES_LOBBY]: 'Cannot close lobby created by someone else',
  [MiddlewareErrorCode.SUBMIT_MOVES_EXACTLY_3]: 'Exactly three moves must be submitted',
  [MiddlewareErrorCode.SUBMIT_MOVES_INVALID_MOVES]: 'One or more invalid moves submitted',
  [MiddlewareErrorCode.INTERNAL_INVALID_DEPLOYMENT]: 'Internal error: Invalid deployment set',
  [MiddlewareErrorCode.INTERNAL_INVALID_POSTING_MODE]: 'Internal error: Invalid posting mode set',
};

export const errorMessageFxn: ErrorMessageFxn = buildErrorCodeTranslator({
  ...PAIMA_MIDDLEWARE_ERROR_MESSAGES,
  ...CATAPULT_MIDDLEWARE_ERROR_MESSAGES,
});

export function buildEndpointErrorFxn(endpointName: string): EndpointErrorFxn {
  return buildAbstractEndpointErrorFxn(errorMessageFxn, endpointName);
}
