import { MatchWinnerResponse } from '../types';

import { buildEndpointErrorFxn, CatapultMiddlewareErrorCode } from '../errors';
import {
  fetchNftTitleImage,
  fetchUserSetNft,
  getRawLatestProcessedBlockHeight,
  getRawLobbyState,
  getRawNewLobbies,
  verifyNft,
  getNftStats as getNftStatsInternal,
  addLobbyCreatorNftStats,
} from '../helpers/auxiliary-queries';
import { calculateRoundEnd } from '../helpers/data-processing';
import { buildMatchExecutor, buildRoundExecutor } from '../helpers/executor-internals';
import { getBlockNumber } from '../helpers/general';
import {
  backendQueryMatchExecutor,
  backendQueryMatchWinner,
  backendQueryOpenLobbies,
  backendQueryRandomLobby,
  backendQueryRoundExecutor,
  backendQueryRoundStatus,
  backendQuerySearchLobby,
  backendQueryUserLobbies,
  backendQueryUserStats,
  indexerQueryAccountNfts,
} from '../helpers/query-constructors';
import {
  AccountNftsData,
  AccountNftsResult,
  FailedResult,
  LobbyState,
  LobbyStates,
  MatchExecutor,
  MatchExecutorData,
  NewLobbies,
  NFT,
  NftId,
  NftScore,
  PackedLobbyState,
  PackedRoundExecutionState,
  PackedUserStats,
  RichOpenLobbyStates,
  RoundExecutor,
  RoundExecutorData,
  RoundStatusData,
  SuccessfulResult,
  UserStats,
} from '../types';

const RETRY_PERIOD_RANDOM_LOBBY = 1000;

async function getLatestProcessedBlockHeight(): Promise<SuccessfulResult<number> | FailedResult> {
  const errorFxn = buildEndpointErrorFxn('getLatestProcessedBlockHeight');
  try {
    return getRawLatestProcessedBlockHeight();
  } catch (err) {
    return errorFxn(CatapultMiddlewareErrorCode.UNKNOWN, err);
  }
}

async function getLobbyState(lobbyID: string): Promise<PackedLobbyState | FailedResult> {
  const errorFxn = buildEndpointErrorFxn('getLobbyState');

  let packedLobbyState: PackedLobbyState | FailedResult;
  let latestBlockHeight: number;

  try {
    [packedLobbyState, latestBlockHeight] = await Promise.all([
      getRawLobbyState(lobbyID),
      getBlockNumber(),
    ]);

    if (!packedLobbyState.success) {
      return errorFxn(packedLobbyState.errorMessage);
    }
  } catch (err) {
    return errorFxn(CatapultMiddlewareErrorCode.ERROR_QUERYING_BACKEND_ENDPOINT, err);
  }

  try {
    const l: LobbyState = packedLobbyState.lobby;
    // TODO: properly typecheck? Or should have happened in getRawLobbyState?
    let [start, length] = [0, 0];

    if (l.lobby_state === 'active') {
      start = l.round_start_height;
      length = l.round_length;
    }

    const end = calculateRoundEnd(start, length, latestBlockHeight);

    return {
      success: true,
      lobby: {
        ...l,
        round_ends_in_blocks: end.blocks,
        round_ends_in_secs: end.seconds,
      },
    };
  } catch (err) {
    return errorFxn(CatapultMiddlewareErrorCode.INVALID_RESPONSE_FROM_BACKEND, err);
  }
}

async function getLobbySearch(
  wallet: string,
  searchQuery: string,
  page: number,
  count?: number
): Promise<RichOpenLobbyStates | FailedResult> {
  const errorFxn = buildEndpointErrorFxn('getLobbySearch');

  let response: Response;
  let latestBlockHeight: number;
  try {
    const query = backendQuerySearchLobby(wallet, searchQuery, page, count);
    [response, latestBlockHeight] = await Promise.all([fetch(query), getBlockNumber()]);
  } catch (err) {
    return errorFxn(CatapultMiddlewareErrorCode.ERROR_QUERYING_BACKEND_ENDPOINT, err);
  }

  try {
    const j = await response.json();
    const richLobbies = await addLobbyCreatorNftStats(j.lobbies, latestBlockHeight);
    // TODO: properly typecheck
    return {
      success: true,
      lobbies: richLobbies,
    };
  } catch (err) {
    return errorFxn(CatapultMiddlewareErrorCode.INVALID_RESPONSE_FROM_BACKEND, err);
  }
}

async function getRoundExecutionState(
  lobbyID: string,
  round: number
): Promise<PackedRoundExecutionState | FailedResult> {
  const errorFxn = buildEndpointErrorFxn('getRoundExecutionState');

  let res: Response;
  let latestBlockHeight: number;

  try {
    const query = backendQueryRoundStatus(lobbyID, round);
    [res, latestBlockHeight] = await Promise.all([fetch(query), getBlockNumber()]);
  } catch (err) {
    return errorFxn(CatapultMiddlewareErrorCode.ERROR_QUERYING_BACKEND_ENDPOINT, err);
  }

  try {
    const roundStatusData = (await res.json()) as RoundStatusData;
    const r = roundStatusData.round;
    // TODO: properly typecheck

    let [start, length] = [r.roundStarted, r.roundLength];
    const end = calculateRoundEnd(start, length, latestBlockHeight);
    return {
      success: true,
      round: {
        executed: r.executed,
        usersWhoSubmittedMoves: r.usersWhoSubmittedMoves,
        roundEndsInBlocks: end.blocks,
        roundEndsInSeconds: end.seconds,
      },
    };
  } catch (err) {
    return errorFxn(CatapultMiddlewareErrorCode.INVALID_RESPONSE_FROM_BACKEND, err);
  }
}

async function getUserStats(walletAddress: string): Promise<PackedUserStats | FailedResult> {
  const errorFxn = buildEndpointErrorFxn('getUserStats');

  let res: Response;
  try {
    const query = backendQueryUserStats(walletAddress);
    res = await fetch(query);
  } catch (err) {
    return errorFxn(CatapultMiddlewareErrorCode.ERROR_QUERYING_BACKEND_ENDPOINT, err);
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
        ties: j.stats.ties,
      },
    };
  } catch (err) {
    return errorFxn(CatapultMiddlewareErrorCode.INVALID_RESPONSE_FROM_BACKEND, err);
  }
}

async function getUserWalletNfts(address: string): Promise<SuccessfulResult<NFT[]> | FailedResult> {
  const errorFxn = buildEndpointErrorFxn('getUserWalletNfts');

  const initSize = 100;
  const resultList: AccountNftsResult[] = [];
  let pages: number = 1;

  for (let page = 0; page < pages; page++) {
    let res: Response;

    try {
      const query = indexerQueryAccountNfts(address, initSize, page);
      res = await fetch(query);
    } catch (err) {
      return errorFxn(CatapultMiddlewareErrorCode.ERROR_QUERYING_INDEXER_ENDPOINT, err);
    }

    try {
      const j = (await res.json()) as { response: AccountNftsData };
      // TODO: properly type check
      if (page === 0) {
        pages = j.response.pages;
      }
      resultList.push(...j.response.result);
    } catch (err) {
      return errorFxn(CatapultMiddlewareErrorCode.INVALID_RESPONSE_FROM_INDEXER, err);
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
    return errorFxn(CatapultMiddlewareErrorCode.INVALID_RESPONSE_FROM_INDEXER, err);
  }
}

async function getUserSetNFT(wallet: string): Promise<SuccessfulResult<NFT> | FailedResult> {
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
    return errorFxn(CatapultMiddlewareErrorCode.ERROR_QUERYING_BACKEND_ENDPOINT, err);
  }

  // Verify NFT ownership with the indexer:
  try {
    const res = await verifyNft(nftId, wallet, latestBlockHeight);
    if (!res.success) {
      return res;
    }
  } catch (err) {
    return errorFxn(CatapultMiddlewareErrorCode.ERROR_QUERYING_INDEXER_ENDPOINT, err);
  }

  // Fetch title and image of NFT and return result:
  try {
    return fetchNftTitleImage(nftId);
  } catch (err) {
    return errorFxn(CatapultMiddlewareErrorCode.ERROR_QUERYING_INDEXER_ENDPOINT, err);
  }
}

async function getNewLobbies(
  wallet: string,
  blockHeight: number
): Promise<NewLobbies | FailedResult> {
  const errorFxn = buildEndpointErrorFxn('getNewLobbies');
  try {
    return getRawNewLobbies(wallet, blockHeight);
  } catch (err) {
    return errorFxn(CatapultMiddlewareErrorCode.UNKNOWN, err);
  }
}

async function getUserLobbiesMatches(
  walletAddress: string,
  page: number,
  count?: number
): Promise<LobbyStates | FailedResult> {
  const errorFxn = buildEndpointErrorFxn('getUserLobbiesMatches');

  let res: Response;
  try {
    const query = backendQueryUserLobbies(walletAddress, count, page);
    res = await fetch(query);
  } catch (err) {
    return errorFxn(CatapultMiddlewareErrorCode.ERROR_QUERYING_BACKEND_ENDPOINT, err);
  }

  try {
    const j = (await res.json()) as { lobbies: LobbyState[] };
    // TODO: properly type check
    return {
      success: true,
      lobbies: j.lobbies,
    };
  } catch (err) {
    return errorFxn(CatapultMiddlewareErrorCode.INVALID_RESPONSE_FROM_BACKEND, err);
  }
}

async function getOpenLobbies(
  wallet: string,
  page: number,
  count?: number
): Promise<RichOpenLobbyStates | FailedResult> {
  const errorFxn = buildEndpointErrorFxn('getOpenLobbies');

  let res: Response;
  let latestBlockHeight: number;

  try {
    const query = backendQueryOpenLobbies(wallet, count, page);
    [res, latestBlockHeight] = await Promise.all([fetch(query), getBlockNumber()]);
  } catch (err) {
    return errorFxn(CatapultMiddlewareErrorCode.ERROR_QUERYING_BACKEND_ENDPOINT, err);
  }

  try {
    const j = await res.json();
    const richLobbies = await addLobbyCreatorNftStats(j.lobbies, latestBlockHeight);
    return {
      success: true,
      lobbies: richLobbies,
    };
  } catch (err) {
    return errorFxn(CatapultMiddlewareErrorCode.INVALID_RESPONSE_FROM_BACKEND, err);
  }
}

async function getRandomOpenLobby(): Promise<PackedLobbyState | FailedResult> {
  const errorFxn = buildEndpointErrorFxn('getRandomOpenLobby');

  let res: Response;
  try {
    const query = backendQueryRandomLobby();
    res = await fetch(query);
  } catch (err) {
    return errorFxn(CatapultMiddlewareErrorCode.ERROR_QUERYING_BACKEND_ENDPOINT, err);
  }

  try {
    const j = (await res.json()) as { lobby: LobbyState };
    if (j.lobby === null) {
      return errorFxn(CatapultMiddlewareErrorCode.NO_OPEN_LOBBIES);
    }
    return {
      success: true,
      lobby: j.lobby,
    };
  } catch (err) {
    return errorFxn(CatapultMiddlewareErrorCode.INVALID_RESPONSE_FROM_BACKEND, err);
  }
}

async function getMatchWinner(
  lobbyId: string
): Promise<SuccessfulResult<MatchWinnerResponse> | FailedResult> {
  const errorFxn = buildEndpointErrorFxn('getMatchWinner');

  let res: Response;
  try {
    const query = backendQueryMatchWinner(lobbyId);
    res = await fetch(query);
  } catch (err) {
    return errorFxn(CatapultMiddlewareErrorCode.ERROR_QUERYING_BACKEND_ENDPOINT, err);
  }

  try {
    const j = await res.json();
    return {
      success: true,
      result: {
        match_status: j.match_status,
        winner_address: j.winner_address,
      },
    };
  } catch (err) {
    return errorFxn(CatapultMiddlewareErrorCode.INVALID_RESPONSE_FROM_BACKEND, err);
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
    return errorFxn(CatapultMiddlewareErrorCode.ERROR_QUERYING_BACKEND_ENDPOINT, err);
  }

  let data: RoundExecutorData;
  try {
    data = (await res.json()) as RoundExecutorData;
    // TODO: more proper type checking
  } catch (err) {
    return errorFxn(CatapultMiddlewareErrorCode.INVALID_RESPONSE_FROM_BACKEND, err);
  }

  // Process data:
  try {
    const executor = await buildRoundExecutor(data);
    return {
      success: true,
      result: executor,
    };
  } catch (err) {
    return errorFxn(CatapultMiddlewareErrorCode.UNABLE_TO_BUILD_EXECUTOR, err);
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
    return errorFxn(CatapultMiddlewareErrorCode.ERROR_QUERYING_BACKEND_ENDPOINT, err);
  }

  let data: MatchExecutorData;

  try {
    data = (await res.json()) as MatchExecutorData;
    // TODO: more proper error checking
  } catch (err) {
    return errorFxn(CatapultMiddlewareErrorCode.INVALID_RESPONSE_FROM_BACKEND, err);
  }

  // Process data:
  try {
    const executor = await buildMatchExecutor(data);
    return {
      success: true,
      result: executor,
    };
  } catch (err) {
    return errorFxn(CatapultMiddlewareErrorCode.UNABLE_TO_BUILD_EXECUTOR, err);
  }
}

export const queryEndpoints = {
  getUserStats,
  getLobbyState,
  getLobbySearch,
  getRoundExecutionState,
  getRandomOpenLobby,
  getOpenLobbies,
  getUserLobbiesMatches,
  getUserWalletNfts,
  getLatestProcessedBlockHeight,
  getNewLobbies,
  getUserSetNFT,
  getMatchWinner,
  getNftStats,
  getRoundExecutor,
  getMatchExecutor,
};
