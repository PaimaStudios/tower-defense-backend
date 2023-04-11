import type { FailedResult } from 'paima-engine/paima-mw-core';
import { PaimaMiddlewareErrorCode } from 'paima-engine/paima-mw-core';
import { pushLog } from 'paima-engine/paima-mw-core';
import type { ContractAddress, MatchConfig } from '@tower-defense/utils';
import { buildEndpointErrorFxn, MiddlewareErrorCode } from '../errors';
import type {
  LobbyState,
  NewLobbies,
  NewLobby,
  NFT,
  NftId,
  NftScore,
  PackedLobbyState,
  SuccessfulResult,
} from '../types';
import { nftScoreSnakeToCamel, userCreatedLobby, userJoinedLobby } from './utility-functions';
import {
  backendQueryLobbyState,
  backendQueryUserConfigs,
  backendQueryUserLobbiesBlockheight,
  backendQueryUserNft,
  indexerQueryHistoricalOwner,
  indexerQueryTitleImage,
  statefulQueryNftScore,
} from './query-constructors';
import type { WalletAddress } from 'paima-engine/paima-utils';

export async function getRawLobbyState(lobbyID: string): Promise<PackedLobbyState | FailedResult> {
  const errorFxn = buildEndpointErrorFxn('getRawLobbyState');

  let res: Response;
  try {
    const query = backendQueryLobbyState(lobbyID);
    res = await fetch(query);
  } catch (err) {
    return errorFxn(PaimaMiddlewareErrorCode.ERROR_QUERYING_BACKEND_ENDPOINT, err);
  }

  try {
    const j = (await res.json()) as { lobby: LobbyState };
    // TODO: properly typecheck
    return {
      success: true,
      lobby: j.lobby,
    };
  } catch (err) {
    return errorFxn(PaimaMiddlewareErrorCode.INVALID_RESPONSE_FROM_BACKEND, err);
  }
}

export async function getRawNewLobbies(
  wallet: string,
  blockHeight: number
): Promise<NewLobbies | FailedResult> {
  const errorFxn = buildEndpointErrorFxn('getRawNewLobbies');

  let res: Response;
  try {
    const query = backendQueryUserLobbiesBlockheight(wallet, blockHeight);
    res = await fetch(query);
  } catch (err) {
    return errorFxn(PaimaMiddlewareErrorCode.ERROR_QUERYING_BACKEND_ENDPOINT, err);
  }

  try {
    const j = (await res.json()) as { lobbies: NewLobby[] };
    // TODO: properly typecheck
    return {
      success: true,
      lobbies: j.lobbies,
    };
  } catch (err) {
    return errorFxn(PaimaMiddlewareErrorCode.INVALID_RESPONSE_FROM_BACKEND, err);
  }
}

export async function getNonemptyNewLobbies(
  address: string,
  blockHeight: number
): Promise<NewLobbies> {
  const newLobbies = await getRawNewLobbies(address, blockHeight);
  if (!newLobbies.success) {
    throw new Error('Failed to get new lobbies');
  } else if (newLobbies.lobbies.length === 0) {
    throw new Error('Received an empty list of new lobbies');
  } else {
    return newLobbies;
  }
}

export async function getLobbyStateWithUser(
  lobbyID: string,
  address: string
): Promise<PackedLobbyState> {
  const lobbyState = await getRawLobbyState(lobbyID);
  if (!lobbyState.success) {
    throw new Error('Failed to get lobby state');
  } else if (userJoinedLobby(address, lobbyState) || userCreatedLobby(address, lobbyState)) {
    return lobbyState;
  } else {
    throw new Error('User is not in the lobby');
  }
}

export async function fetchUserSetNft(
  address: string
): Promise<SuccessfulResult<NftId> | FailedResult> {
  const errorFxn = buildEndpointErrorFxn('fetchUserSetNft');
  let res: Response;

  try {
    const query = backendQueryUserNft(address);
    res = await fetch(query);
  } catch (err) {
    return errorFxn(PaimaMiddlewareErrorCode.ERROR_QUERYING_BACKEND_ENDPOINT, err);
  }

  try {
    const j = await res.json();
    const nftAddress: ContractAddress = j.nft.address;
    const tokenId: number = parseInt(j.nft.token_id, 10);
    if (isNaN(tokenId)) {
      // TODO: can the backend store a NaN somehow? Is it enforced to be an integer?
      return errorFxn(PaimaMiddlewareErrorCode.INVALID_RESPONSE_FROM_BACKEND);
    }
    return {
      success: true,
      result: {
        nftAddress,
        tokenId,
      },
    };
  } catch (err) {
    return errorFxn(PaimaMiddlewareErrorCode.INVALID_RESPONSE_FROM_BACKEND, err);
  }
}

export async function verifyNft(
  nftId: NftId,
  address: WalletAddress,
  latestBlockHeight: number
): Promise<SuccessfulResult<true> | FailedResult> {
  const errorFxn = buildEndpointErrorFxn('verifyNft');

  let res: Response;

  try {
    const query = indexerQueryHistoricalOwner(nftId.nftAddress, nftId.tokenId, latestBlockHeight);
    res = await fetch(query);
  } catch (err) {
    return errorFxn(MiddlewareErrorCode.ERROR_QUERYING_INDEXER_ENDPOINT, err);
  }

  try {
    const j = await res.json();
    // TODO: properly type check
    if (!j.success) {
      return errorFxn(MiddlewareErrorCode.UNABLE_TO_VERIFY_NFT_OWNERSHIP);
    }
    if (j.result.toLowerCase() !== address.toLowerCase()) {
      return errorFxn(MiddlewareErrorCode.NFT_OWNED_BY_DIFFERENT_ADDRESS);
    }
  } catch (err) {
    return errorFxn(MiddlewareErrorCode.INVALID_RESPONSE_FROM_INDEXER, err);
  }

  return {
    success: true,
    result: true,
  };
}

export async function fetchNftTitleImage(
  nftId: NftId
): Promise<SuccessfulResult<NFT> | FailedResult> {
  const errorFxn = buildEndpointErrorFxn('fetchNftTitleImage');

  let res: Response;

  // Fetch title and image of NFT and return result:
  try {
    const query = indexerQueryTitleImage(nftId.nftAddress, nftId.tokenId);
    res = await fetch(query);
  } catch (err) {
    return errorFxn(MiddlewareErrorCode.ERROR_QUERYING_INDEXER_ENDPOINT, err);
  }

  try {
    const j = await res.json();
    if (!j.success) {
      return errorFxn(MiddlewareErrorCode.NFT_TITLE_IMAGE_UNKNOWN);
    }
    const titleAndImage = j.result;
    return {
      success: true,
      result: {
        title: titleAndImage.title,
        imageUrl: titleAndImage.image,
        ...nftId,
      },
    };
  } catch (err) {
    return errorFxn(MiddlewareErrorCode.INVALID_RESPONSE_FROM_INDEXER, err);
  }
}

export async function fetchAndVerifyNft(
  address: WalletAddress,
  blockHeight: number
): Promise<NftId> {
  const EMPTY_NFT_ID: NftId = {
    nftAddress: '',
    tokenId: 0,
  };

  const nftRes = await fetchUserSetNft(address);
  if (!nftRes.success) {
    return EMPTY_NFT_ID;
  }
  const nftId = nftRes.result;

  const verifyRes = await verifyNft(nftId, address, blockHeight);
  if (!verifyRes.success) {
    return EMPTY_NFT_ID;
  }

  return nftId;
}

export async function getNftStats(
  nftContract: string,
  tokenId: number
): Promise<SuccessfulResult<NftScore> | FailedResult> {
  const errorFxn = buildEndpointErrorFxn('getNftStats');

  let res: Response;
  try {
    const query = statefulQueryNftScore(nftContract, tokenId);
    pushLog('[getNftStats] fetching with query:', query);
    res = await fetch(query);
  } catch (err) {
    return errorFxn(MiddlewareErrorCode.ERROR_QUERYING_STATEFUL_ENDPOINT, err);
  }

  try {
    const j = (await res.json()).data;
    return {
      success: true,
      result: nftScoreSnakeToCamel(j),
    };
  } catch (err) {
    return errorFxn(MiddlewareErrorCode.INVALID_RESPONSE_FROM_STATEFUL, err);
  }
}
type UserConfigs = {
  success: boolean;
  configs: DBConfigs[]
}
type DBConfigs = {
  content: string;
  creator: string;
  id: string;
  version: number;
}
export async function getRawUserConfigs(
  wallet: string,
): Promise<UserConfigs| FailedResult> {
  const errorFxn = buildEndpointErrorFxn('getRawNewLobbies');

  let res: Response;
  try {
    const query = backendQueryUserConfigs(wallet);
    res = await fetch(query);
  } catch (err) {
    return errorFxn(PaimaMiddlewareErrorCode.ERROR_QUERYING_BACKEND_ENDPOINT, err);
  }

  try {
    const j = (await res.json()) as { configs: DBConfigs[] };
    // TODO: properly typecheck
    return {
      success: true,
      configs: j.configs,
    };
  } catch (err) {
    return errorFxn(PaimaMiddlewareErrorCode.INVALID_RESPONSE_FROM_BACKEND, err);
  }
}
export async function getUserConfigs(
  address: string
): Promise<UserConfigs> {
  const configs = await getRawUserConfigs(address);
  if (!configs.success) {
    throw new Error('Failed to get user configs');
  } else if (configs.configs.length > 0) {
    return configs;
  } else {
    throw new Error('User is not in the lobby');
  }
}