import type { EndpointErrorFxn } from 'paima-engine/paima-mw-core';
import {
  PaimaMiddlewareErrorCode,
  buildAbstractEndpointErrorFxn,
  PAIMA_MIDDLEWARE_ERROR_MESSAGES,
} from 'paima-engine/paima-mw-core';
import type { ErrorMessageFxn } from 'paima-engine/paima-utils';
import { buildErrorCodeTranslator } from 'paima-engine/paima-utils';

export const enum MiddlewareErrorCode {
  GENERIC_GAME_ERROR = PaimaMiddlewareErrorCode.FINAL_PAIMA_GENERIC_ERROR + 1,
  // Query endpoint related:
  ERROR_QUERYING_INDEXER_ENDPOINT,
  ERROR_QUERYING_STATEFUL_ENDPOINT,
  INVALID_RESPONSE_FROM_INDEXER,
  INVALID_RESPONSE_FROM_STATEFUL,
  CALCULATED_ROUND_END_IN_PAST,
  UNABLE_TO_BUILD_EXECUTOR,
  UNABLE_TO_VERIFY_NFT_OWNERSHIP,
  NFT_OWNED_BY_DIFFERENT_ADDRESS,
  NFT_TITLE_IMAGE_UNKNOWN,
  LOBBY_NOT_FOUND,
  NO_OPEN_LOBBIES,
  // Write endpoint related:
  FAILURE_VERIFYING_LOBBY_CREATION,
  FAILURE_VERIFYING_LOBBY_CLOSE,
  FAILURE_VERIFYING_LOBBY_JOIN,
  FAILURE_VERIFYING_CONFIG_REGISTER,
  CANNOT_JOIN_OWN_LOBBY,
  CANNOT_CLOSE_SOMEONES_LOBBY,
  SUBMIT_MOVES_INVALID_MOVES,
}

const MIDDLEWARE_ERROR_MESSAGES: Record<MiddlewareErrorCode, string> = {
  [MiddlewareErrorCode.GENERIC_GAME_ERROR]: 'Unspecified generic Game error',
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
  [MiddlewareErrorCode.UNABLE_TO_VERIFY_NFT_OWNERSHIP]: 'Unable to verify NFT ownership',
  [MiddlewareErrorCode.NFT_OWNED_BY_DIFFERENT_ADDRESS]:
    'Registered NFT is owned by different address',
  [MiddlewareErrorCode.NFT_TITLE_IMAGE_UNKNOWN]:
    'Indexer unable to find title and image of registered NFT',
  [MiddlewareErrorCode.LOBBY_NOT_FOUND]: 'Lobby not found',
  [MiddlewareErrorCode.NO_OPEN_LOBBIES]: 'No open lobbies were found, please try again later',
  [MiddlewareErrorCode.FAILURE_VERIFYING_LOBBY_CREATION]: 'Failure while verifying lobby creation',
  [MiddlewareErrorCode.FAILURE_VERIFYING_LOBBY_CLOSE]: 'Failure while verifying lobby closing',
  [MiddlewareErrorCode.FAILURE_VERIFYING_LOBBY_JOIN]: 'Failure while verifying lobby join',
  [MiddlewareErrorCode.FAILURE_VERIFYING_CONFIG_REGISTER]:
    'Failure while verifying config registration',
  [MiddlewareErrorCode.CANNOT_JOIN_OWN_LOBBY]: 'Cannot join your own lobby',
  [MiddlewareErrorCode.CANNOT_CLOSE_SOMEONES_LOBBY]: 'Cannot close lobby created by someone else',
  [MiddlewareErrorCode.SUBMIT_MOVES_INVALID_MOVES]: 'One or more invalid moves submitted',
};

const errorMessageFxn: ErrorMessageFxn = buildErrorCodeTranslator({
  ...PAIMA_MIDDLEWARE_ERROR_MESSAGES,
  ...MIDDLEWARE_ERROR_MESSAGES,
});

export function buildEndpointErrorFxn(endpointName: string): EndpointErrorFxn {
  return buildAbstractEndpointErrorFxn(errorMessageFxn, endpointName);
}
