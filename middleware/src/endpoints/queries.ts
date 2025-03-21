import type {
  MapByNameResponse,
  MatchWinnerResponse,
  PackedCurrentRound,
  PackedLobbyConfig,
  PackedLobbyResponse,
} from '../types';

import { buildEndpointErrorFxn, MiddlewareErrorCode } from '../errors';
import {
  fetchNftTitleImage,
  fetchUserSetNft,
  getRawLobbyState,
  getRawNewLobbies,
  verifyNft,
  getNftStats as getNftStatsInternal,
} from '../helpers/auxiliary-queries';
import { calculateRoundEnd } from '../helpers/utility-functions';
import { buildMatchExecutor, buildRoundExecutor } from '../helpers/executors';
import {
  backendQueryCurrentRound,
  backendQueryFinishedLobbies,
  backendQueryLobbyConfig,
  backendQueryMapByName,
  backendQueryMatchExecutor,
  backendQueryMatchWinner,
  backendQueryOpenLobbies,
  backendQueryRandomLobby,
  backendQueryRoundExecutor,
  backendQuerySearchLobby,
  backendQueryUserLobbies,
  backendQueryUserStats,
  indexerQueryAccountNfts,
} from '../helpers/query-constructors';
import type {
  AccountNftsData,
  AccountNftsResult,
  LobbyState,
  LobbyStates,
  NewLobbies,
  NFT,
  NftId,
  NftScore,
  PackedLobbyState,
  PackedUserStats,
  SuccessfulResult,
  UserStats,
} from '../types';
import type {
  LobbyStatus,
  MapName,
  MatchConfig,
  MatchExecutorData,
  RoundExecutorData,
} from '@tower-defense/utils';
import type { FailedResult } from '@paima/utils';
import { getBlockNumber, PaimaMiddlewareErrorCode } from '@paima/mw-core';
import type { MatchExecutor, RoundExecutor } from '@paima/executors';
import type { WalletAddress } from '@paima/chain-types';
import { calculateMatchStats } from '@tower-defense/game-logic';

async function getLobbyState(lobbyID: string): Promise<PackedLobbyState | FailedResult> {
  const errorFxn = buildEndpointErrorFxn('getLobbyState');

  let packedLobbyState: PackedLobbyResponse | FailedResult;
  let latestBlockHeight: number;

  try {
    [packedLobbyState, latestBlockHeight] = await Promise.all([
      getRawLobbyState(lobbyID),
      getBlockNumber(),
    ]);

    if (!packedLobbyState.success) {
      return errorFxn(packedLobbyState.errorMessage);
    }
    if (!packedLobbyState.lobby) {
      return errorFxn(MiddlewareErrorCode.LOBBY_NOT_FOUND);
    }
  } catch (err) {
    return errorFxn(PaimaMiddlewareErrorCode.ERROR_QUERYING_BACKEND_ENDPOINT, err);
  }

  try {
    const lobby = packedLobbyState.lobby;
    // TODO: properly typecheck? Or should have happened in getRawLobbyState?
    let [start, length] = [0, 0];

    if (lobby.lobby_state === 'active') {
      start = lobby.round_start_height;
      length = lobby.round_length;
    }

    const end = calculateRoundEnd(start, length, latestBlockHeight);

    return {
      success: true,
      lobby: {
        ...lobby,
        round_ends_in_blocks: end.blocks,
        round_ends_in_secs: end.seconds,
      },
    };
  } catch (err) {
    return errorFxn(PaimaMiddlewareErrorCode.INVALID_RESPONSE_FROM_BACKEND, err);
  }
}

async function getLobbySearch(
  wallet: WalletAddress,
  searchQuery: string,
  page: number,
  count?: number
): Promise<LobbyStates | FailedResult> {
  const errorFxn = buildEndpointErrorFxn('getLobbySearch');

  let response: Response;
  try {
    const query = backendQuerySearchLobby(wallet, searchQuery, page, count);
    response = await fetch(query);
  } catch (err) {
    return errorFxn(PaimaMiddlewareErrorCode.ERROR_QUERYING_BACKEND_ENDPOINT, err);
  }

  try {
    const j = (await response.json()) as { lobbies: LobbyState[] };
    // TODO: properly typecheck
    return {
      success: true,
      lobbies: j.lobbies,
    };
  } catch (err) {
    return errorFxn(PaimaMiddlewareErrorCode.INVALID_RESPONSE_FROM_BACKEND, err);
  }
}

async function getUserFinishedLobbies(
  wallet: WalletAddress,
  page: number,
  count?: number
): Promise<LobbyStates | FailedResult> {
  const errorFxn = buildEndpointErrorFxn('getUserFinishedLobbies');

  let response: Response;
  try {
    const query = backendQueryFinishedLobbies(wallet, page, count);
    response = await fetch(query);
  } catch (err) {
    return errorFxn(PaimaMiddlewareErrorCode.ERROR_QUERYING_BACKEND_ENDPOINT, err);
  }

  try {
    const j = (await response.json()) as { lobbies: LobbyState[] };
    // TODO: properly typecheck
    return {
      success: true,
      lobbies: j.lobbies,
    };
  } catch (err) {
    return errorFxn(PaimaMiddlewareErrorCode.INVALID_RESPONSE_FROM_BACKEND, err);
  }
}

async function getConfig(lobbyID: string): Promise<PackedLobbyConfig | FailedResult> {
  const errorFxn = buildEndpointErrorFxn('getConfig');

  let res: Response;
  try {
    const query = backendQueryLobbyConfig(lobbyID);
    res = await fetch(query);
  } catch (err) {
    return errorFxn(PaimaMiddlewareErrorCode.ERROR_QUERYING_BACKEND_ENDPOINT, err);
  }

  try {
    const j = (await res.json()) as { config: MatchConfig };
    // TODO: properly typecheck
    return {
      success: true,
      result: j,
    };
  } catch (err) {
    return errorFxn(PaimaMiddlewareErrorCode.INVALID_RESPONSE_FROM_BACKEND, err);
  }
}
async function getCurrentRound(lobbyID: string): Promise<PackedCurrentRound | FailedResult> {
  const errorFxn = buildEndpointErrorFxn('getCurrentRound');

  let res: Response;
  try {
    const query = backendQueryCurrentRound(lobbyID);
    res = await fetch(query);
  } catch (err) {
    return errorFxn(PaimaMiddlewareErrorCode.ERROR_QUERYING_BACKEND_ENDPOINT, err);
  }

  try {
    const j = (await res.json()) as { currentRound: number; roundStartHeight: number };
    // TODO: properly typecheck
    return {
      success: true,
      result: j,
    };
  } catch (err) {
    return errorFxn(PaimaMiddlewareErrorCode.INVALID_RESPONSE_FROM_BACKEND, err);
  }
}
async function getUserStats(walletAddress: WalletAddress): Promise<PackedUserStats | FailedResult> {
  const errorFxn = buildEndpointErrorFxn('getUserStats');

  let res: Response;
  try {
    const query = backendQueryUserStats(walletAddress);
    res = await fetch(query);
  } catch (err) {
    return errorFxn(PaimaMiddlewareErrorCode.ERROR_QUERYING_BACKEND_ENDPOINT, err);
  }

  try {
    const j = (await res.json()) as { stats: UserStats };
    // TODO: properly typecheck
    return {
      success: true,
      stats: {
        wallet: j.stats.wallet,
        wins: j.stats.wins,
        losses: j.stats.losses,
      },
    };
  } catch (err) {
    return errorFxn(PaimaMiddlewareErrorCode.INVALID_RESPONSE_FROM_BACKEND, err);
  }
}

async function getUserWalletNfts(
  address: WalletAddress
): Promise<SuccessfulResult<NFT[]> | FailedResult> {
  const errorFxn = buildEndpointErrorFxn('getUserWalletNfts');

  const initSize = 100;
  const resultList: AccountNftsResult[] = [];
  let pages = 1;

  for (let page = 0; page < pages; page++) {
    let res: Response;

    try {
      const query = indexerQueryAccountNfts(address, initSize, page);
      res = await fetch(query);
    } catch (err) {
      return errorFxn(MiddlewareErrorCode.ERROR_QUERYING_INDEXER_ENDPOINT, err);
    }

    try {
      const j = (await res.json()) as { response: AccountNftsData };
      // TODO: properly type check
      if (page === 0) {
        pages = j.response.pages;
      }
      resultList.push(...j.response.result);
    } catch (err) {
      return errorFxn(MiddlewareErrorCode.INVALID_RESPONSE_FROM_INDEXER, err);
    }
  }

  try {
    return {
      success: true,
      result: resultList.map((r: AccountNftsResult) => ({
        title: r.metadata.name,
        imageUrl: r.metadata.image,
        nftAddress: r.contract,
        tokenId: r.tokenId,
      })),
    };
  } catch (err) {
    return errorFxn(MiddlewareErrorCode.INVALID_RESPONSE_FROM_INDEXER, err);
  }
}

async function getUserSetNFT(wallet: WalletAddress): Promise<SuccessfulResult<NFT> | FailedResult> {
  const errorFxn = buildEndpointErrorFxn('getUserSetNFT');

  let nftId: NftId;
  let latestBlockHeight: number;

  // Get registered NFT from the backend:
  try {
    const [res, blockNumber] = await Promise.all([fetchUserSetNft(wallet), getBlockNumber()]);
    if (!res.success) {
      return res;
    }
    latestBlockHeight = blockNumber;
    nftId = res.result;
  } catch (err) {
    return errorFxn(PaimaMiddlewareErrorCode.ERROR_QUERYING_BACKEND_ENDPOINT, err);
  }

  // Verify NFT ownership with the indexer:
  try {
    const res = await verifyNft(nftId, wallet, latestBlockHeight);
    if (!res.success) {
      return res;
    }
  } catch (err) {
    return errorFxn(MiddlewareErrorCode.ERROR_QUERYING_INDEXER_ENDPOINT, err);
  }

  // Fetch title and image of NFT and return result:
  try {
    return fetchNftTitleImage(nftId);
  } catch (err) {
    return errorFxn(MiddlewareErrorCode.ERROR_QUERYING_INDEXER_ENDPOINT, err);
  }
}

async function getNewLobbies(
  wallet: WalletAddress,
  blockHeight: number
): Promise<NewLobbies | FailedResult> {
  const errorFxn = buildEndpointErrorFxn('getNewLobbies');
  try {
    return getRawNewLobbies(wallet, blockHeight);
  } catch (err) {
    return errorFxn(PaimaMiddlewareErrorCode.UNKNOWN, err);
  }
}

async function getUserLobbiesMatches(
  walletAddress: WalletAddress,
  page: number,
  count?: number
): Promise<LobbyStates | FailedResult> {
  const errorFxn = buildEndpointErrorFxn('getUserLobbiesMatches');

  let res: Response;
  try {
    const query = backendQueryUserLobbies(walletAddress, count, page);
    res = await fetch(query);
  } catch (err) {
    return errorFxn(PaimaMiddlewareErrorCode.ERROR_QUERYING_BACKEND_ENDPOINT, err);
  }

  try {
    const j = (await res.json()) as { lobbies: LobbyState[] };
    // TODO: properly type check
    return {
      success: true,
      lobbies: j.lobbies,
    };
  } catch (err) {
    return errorFxn(PaimaMiddlewareErrorCode.INVALID_RESPONSE_FROM_BACKEND, err);
  }
}

async function getOpenLobbies(
  wallet: WalletAddress,
  page: number,
  count?: number
): Promise<LobbyStates | FailedResult> {
  const errorFxn = buildEndpointErrorFxn('getOpenLobbies');

  let res: Response;

  try {
    const query = backendQueryOpenLobbies(wallet, count, page);
    res = await fetch(query);
  } catch (err) {
    return errorFxn(PaimaMiddlewareErrorCode.ERROR_QUERYING_BACKEND_ENDPOINT, err);
  }

  try {
    const j = (await res.json()) as { lobbies: LobbyState[] };
    return {
      success: true,
      lobbies: j.lobbies,
    };
  } catch (err) {
    return errorFxn(PaimaMiddlewareErrorCode.INVALID_RESPONSE_FROM_BACKEND, err);
  }
}

async function getRandomOpenLobby(): Promise<PackedLobbyState | FailedResult> {
  const errorFxn = buildEndpointErrorFxn('getRandomOpenLobby');

  let res: Response;
  try {
    const query = backendQueryRandomLobby();
    res = await fetch(query);
  } catch (err) {
    return errorFxn(PaimaMiddlewareErrorCode.ERROR_QUERYING_BACKEND_ENDPOINT, err);
  }

  try {
    const j = (await res.json()) as { lobby: LobbyState };
    if (j.lobby === null) {
      return errorFxn(MiddlewareErrorCode.NO_OPEN_LOBBIES);
    }
    return {
      success: true,
      lobby: j.lobby,
    };
  } catch (err) {
    return errorFxn(PaimaMiddlewareErrorCode.INVALID_RESPONSE_FROM_BACKEND, err);
  }
}

async function getMatchWinner(
  lobbyId: string
): Promise<SuccessfulResult<MatchWinnerResponse> | FailedResult> {
  const errorFxn = buildEndpointErrorFxn('getMatchWinner');

  let matchWinnerResponse: Response;
  let matchExecutorResponse: Response;
  try {
    [matchWinnerResponse, matchExecutorResponse] = await Promise.all([
      fetch(backendQueryMatchWinner(lobbyId)),
      fetch(backendQueryMatchExecutor(lobbyId)),
    ]);
  } catch (err) {
    return errorFxn(PaimaMiddlewareErrorCode.ERROR_QUERYING_BACKEND_ENDPOINT, err);
  }

  try {
    const matchWinner = (await matchWinnerResponse.json()) as {
      match_status?: LobbyStatus;
      winner_address?: string;
    };
    const matchExecutor: MatchExecutorData = await matchExecutorResponse.json();

    return {
      success: true,
      result: {
        ...calculateMatchStats(matchExecutor),
        // WARN: stats below dependant on mutable matchExecutor state (changed in calculateMatchStats)
        match_status: matchWinner.match_status || matchExecutor.lobby.lobby_state,
        winner_address:
          matchWinner.winner_address ||
          (matchExecutor.initialState.defenderBase.health > 0
            ? matchExecutor.initialState.defender
            : matchExecutor.initialState.attacker),
      },
    };
  } catch (err) {
    return errorFxn(PaimaMiddlewareErrorCode.INVALID_RESPONSE_FROM_BACKEND, err);
  }
}

async function getNftStats(
  nftContract: string,
  tokenId: number
): Promise<SuccessfulResult<NftScore> | FailedResult> {
  return getNftStatsInternal(nftContract, tokenId);
}

async function getRoundExecutor(
  lobbyId: string,
  roundNumber: number
): Promise<SuccessfulResult<RoundExecutor> | FailedResult> {
  const errorFxn = buildEndpointErrorFxn('getRoundExecutor');

  // Retrieve data:
  let res: Response;
  try {
    const query = backendQueryRoundExecutor(lobbyId, roundNumber);
    res = await fetch(query);
  } catch (err) {
    return errorFxn(PaimaMiddlewareErrorCode.ERROR_QUERYING_BACKEND_ENDPOINT, err);
  }

  let data: RoundExecutorData;
  try {
    data = (await res.json()) as RoundExecutorData;
    // TODO: more proper type checking
  } catch (err) {
    return errorFxn(PaimaMiddlewareErrorCode.INVALID_RESPONSE_FROM_BACKEND, err);
  }

  // Process data:
  try {
    const executor = await buildRoundExecutor(data);
    return {
      success: true,
      result: executor,
    };
  } catch (err) {
    return errorFxn(MiddlewareErrorCode.UNABLE_TO_BUILD_EXECUTOR, err);
  }
}

async function getMatchExecutor(
  lobbyId: string
): Promise<SuccessfulResult<MatchExecutor> | FailedResult> {
  const errorFxn = buildEndpointErrorFxn('getMatchExecutor');

  // Retrieve data:
  let res: Response;

  try {
    const query = backendQueryMatchExecutor(lobbyId);
    res = await fetch(query);
  } catch (err) {
    return errorFxn(PaimaMiddlewareErrorCode.ERROR_QUERYING_BACKEND_ENDPOINT, err);
  }

  let data: MatchExecutorData;

  try {
    data = (await res.json()) as MatchExecutorData;
    // TODO: more proper error checking
  } catch (err) {
    return errorFxn(PaimaMiddlewareErrorCode.INVALID_RESPONSE_FROM_BACKEND, err);
  }

  // Process data:
  try {
    const executor = await buildMatchExecutor(data);
    return {
      success: true,
      result: executor,
    };
  } catch (err) {
    return errorFxn(MiddlewareErrorCode.UNABLE_TO_BUILD_EXECUTOR, err);
  }
}
async function getMapByName(
  mapName: MapName
): Promise<SuccessfulResult<MapByNameResponse> | FailedResult> {
  const errorFxn = buildEndpointErrorFxn('getMapByName');

  let res: Response;
  try {
    const query = backendQueryMapByName(mapName);
    res = await fetch(query);
  } catch (err) {
    return errorFxn(PaimaMiddlewareErrorCode.ERROR_QUERYING_BACKEND_ENDPOINT, err);
  }

  try {
    const j = await res.json();
    return {
      success: true,
      result: {
        map_layout: j.map_layout,
      },
    };
  } catch (err) {
    return errorFxn(PaimaMiddlewareErrorCode.INVALID_RESPONSE_FROM_BACKEND, err);
  }
}

export const queryEndpoints = {
  getUserStats,
  getLobbyState,
  getLobbySearch,
  getCurrentRound,
  getRandomOpenLobby,
  getOpenLobbies,
  getUserFinishedLobbies,
  getUserLobbiesMatches,
  getUserWalletNfts,
  getNewLobbies,
  getUserSetNFT,
  getMatchWinner,
  getNftStats,
  getRoundExecutor,
  getMatchExecutor,
  getMapByName,
  getConfig,
};
