import { URI, UserAddress } from '@tower-defense/utils';
import { retryPromise } from 'paima-engine/paima-utils';

import { buildEndpointErrorFxn, CatapultMiddlewareErrorCode } from '../errors';
import {
  getNonemptyRandomOpenLobby,
  getRawLatestProcessedBlockHeight,
  getRawLobbyState,
  getRawNewLobbies,
} from '../helpers/auxiliary-queries';
import { calculateRoundEnd } from '../helpers/data-processing';
import { buildMatchExecutor, buildRoundExecutor } from '../helpers/executor-internals';
import { getBlockNumber } from '../helpers/general';
import {
  backendQueryMatchExecutor,
  backendQueryOpenLobbies,
  backendQueryRoundExecutor,
  backendQueryRoundStatus,
  backendQueryUserLobbies,
  backendQueryUserNft,
  backendQueryUserStats,
  indexerQueryAccountNfts,
  indexerQueryHistoricalOwner,
  indexerQueryTitleImage,
} from '../helpers/query-constructors';
import { backendEndpointCall, indexerEndpointCall } from '../helpers/server-interaction';
import {
  AccountNftsData,
  FailedResult,
  LobbyState,
  LobbyStates,
  MatchExecutor,
  MatchExecutorData,
  NewLobbies,
  NFT,
  PackedLobbyState,
  PackedRoundExecutionState,
  PackedUserStats,
  RoundEnd,
  RoundExecutor,
  RoundExecutorData,
  RoundStatusData,
  SuccessfulResult,
  UserStats,
} from '../types';

const RETRY_PERIOD_RANDOM_LOBBY = 1000;

async function getLatestProcessedBlockHeight(): Promise<SuccessfulResult<number> | FailedResult> {
  return getRawLatestProcessedBlockHeight();
}

async function getLobbyState(lobbyID: string): Promise<PackedLobbyState | FailedResult> {
  const errorFxn = buildEndpointErrorFxn('getLobbyState');
  try {
    const [packedLobbyState, latestBlockHeight] = await Promise.all([
      getRawLobbyState(lobbyID),
      getBlockNumber(),
    ]);

    if (!packedLobbyState.success) {
      return errorFxn(CatapultMiddlewareErrorCode.UNKNOWN);
    }

    let [start, length] = [0, 0];
    const l: LobbyState = packedLobbyState.lobby;

    if (l.lobby_state === 'active') {
      if (!l.hasOwnProperty('round_start_height') || !l.hasOwnProperty('round_length')) {
        errorFxn(CatapultMiddlewareErrorCode.INVALID_RESPONSE_FROM_BACKEND);
      } else {
        start = l.round_start_height;
        // length = l.round_length;
      }
    }

    let endVar: RoundEnd;
    try {
      endVar = calculateRoundEnd(start, length, latestBlockHeight);
    } catch (err) {
      errorFxn(CatapultMiddlewareErrorCode.INTERNAL_INVALID_DEPLOYMENT, err);
      endVar = {
        blocks: 0,
        seconds: 0,
      };
    }
    const end = endVar;

    return {
      success: true,
      lobby: {
        ...l,
        // round_ends_in_blocks: end.blocks,
        // round_ends_in_secs: end.seconds,
      },
    };
  } catch (err) {
    return errorFxn(CatapultMiddlewareErrorCode.ERROR_QUERYING_BACKEND_ENDPOINT, err);
  }
}
async function getRoundExecutionState(
  lobbyID: string,
  round: number
): Promise<PackedRoundExecutionState | FailedResult> {
  const errorFxn = buildEndpointErrorFxn('getRoundExecutionState');
  try {
    const query = backendQueryRoundStatus(lobbyID, round);
    const [result, latestBlockHeight] = await Promise.all([
      backendEndpointCall(query),
      getBlockNumber(),
    ]);

    if (!result.success) {
      return errorFxn(CatapultMiddlewareErrorCode.ERROR_QUERYING_BACKEND_ENDPOINT);
    }

    let [start, length] = [0, 0];
    if (
      typeof result.result !== 'object' ||
      result.result === null ||
      !result.result.hasOwnProperty('round')
    ) {
      return errorFxn(CatapultMiddlewareErrorCode.INVALID_RESPONSE_FROM_BACKEND);
    }
    const roundStatusData = result.result as RoundStatusData;
    const r = roundStatusData.round;
    for (const prop of ['roundStarted', 'roundLength', 'executed', 'usersWhoSubmittedMoves']) {
      if (!r.hasOwnProperty(prop)) {
        return errorFxn(
          CatapultMiddlewareErrorCode.INVALID_RESPONSE_FROM_BACKEND,
          `Missing property: stats.${prop}`
        );
      }
    }

    if (!r.hasOwnProperty('roundStarted') || !r.hasOwnProperty('roundLength')) {
      return errorFxn(CatapultMiddlewareErrorCode.INVALID_RESPONSE_FROM_BACKEND);
    } else {
      start = r.roundStarted;
      length = r.roundLength;
    }

    let endVar: RoundEnd;
    try {
      endVar = calculateRoundEnd(start, length, latestBlockHeight);
    } catch (err) {
      errorFxn(CatapultMiddlewareErrorCode.INTERNAL_INVALID_DEPLOYMENT, err);
      endVar = {
        blocks: 0,
        seconds: 0,
      };
    }
    const end = endVar;

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
    return errorFxn(CatapultMiddlewareErrorCode.ERROR_QUERYING_BACKEND_ENDPOINT, err);
  }
}

async function getUserStats(walletAddress: string): Promise<PackedUserStats | FailedResult> {
  const errorFxn = buildEndpointErrorFxn('getUserStats');
  try {
    const query = backendQueryUserStats(walletAddress);
    const result = await backendEndpointCall(query);
    if (!result.success) {
      return errorFxn(CatapultMiddlewareErrorCode.ERROR_QUERYING_BACKEND_ENDPOINT);
    }
    const userStats = result.result as { stats: UserStats };
    if (typeof userStats !== 'object' || userStats === null || !userStats.hasOwnProperty('stats')) {
      return errorFxn(
        CatapultMiddlewareErrorCode.INVALID_RESPONSE_FROM_BACKEND,
        'Missing property: stats'
      );
    }
    for (const prop of ['wallet', 'wins', 'losses', 'ties']) {
      if (!userStats.hasOwnProperty(prop)) {
        return errorFxn(
          CatapultMiddlewareErrorCode.INVALID_RESPONSE_FROM_BACKEND,
          `Missing property: stats.${prop}`
        );
      }
    }
    return {
      success: true,
      ...userStats,
    };
  } catch (err) {
    return errorFxn(CatapultMiddlewareErrorCode.ERROR_QUERYING_BACKEND_ENDPOINT, err);
  }
}

async function getUserWalletNfts(address: string): Promise<SuccessfulResult<NFT[]> | FailedResult> {
  const errorFxn = buildEndpointErrorFxn('getUserWalletNfts');
  const initSize = 100;
  try {
    const query = indexerQueryAccountNfts(address, initSize);
    const result = await indexerEndpointCall(query);
    if (!result.success) {
      return errorFxn(CatapultMiddlewareErrorCode.ERROR_QUERYING_INDEXER_ENDPOINT);
    }
    if (
      typeof result.result !== 'object' ||
      result.result === null ||
      !result.result.hasOwnProperty('response')
    ) {
      return errorFxn(CatapultMiddlewareErrorCode.INVALID_RESPONSE_FROM_BACKEND);
    }
    const j = result.result as { response: AccountNftsData };
    const response = j.response;
    const { pages, totalItems } = response;
    const resultList = response.result;
    if (totalItems > initSize) {
      for (let i = 1; i < pages; i++) {
        const query = indexerQueryAccountNfts(address, initSize, i);
        const result = await indexerEndpointCall(query);
        if (!result.success) {
          return errorFxn(CatapultMiddlewareErrorCode.ERROR_QUERYING_INDEXER_ENDPOINT);
        }
        if (
          typeof result.result !== 'object' ||
          result.result === null ||
          !result.result.hasOwnProperty('response')
        ) {
          return errorFxn(CatapultMiddlewareErrorCode.INVALID_RESPONSE_FROM_BACKEND);
        }
        const j = result.result as { response: AccountNftsData };
        resultList.push(...j.response.result);
      }
    }

    return {
      success: true,
      result: resultList.map((res: any) => ({
        title: res.metadata.name,
        imageUrl: res.metadata.image,
        nftAddress: res.contract,
        tokenId: res.tokenId,
      })),
    };
  } catch (err) {
    return errorFxn(CatapultMiddlewareErrorCode.ERROR_QUERYING_INDEXER_ENDPOINT, err);
  }
}

async function getUserSetNFT(wallet: string): Promise<SuccessfulResult<NFT> | FailedResult> {
  const errorFxn = buildEndpointErrorFxn('getUserSetNFT');

  let nftAddressVar: string;
  let nftTokenIdVar: number;
  let ownershipQueryVar: string;

  // Get registered NFT from the backend:
  try {
    const query = backendQueryUserNft(wallet);
    const [result, latestBlockHeight] = await Promise.all([
      backendEndpointCall(query),
      getBlockNumber(),
    ]);
    if (!result.success) {
      return errorFxn(CatapultMiddlewareErrorCode.ERROR_QUERYING_BACKEND_ENDPOINT);
    }
    if (
      typeof result.result !== 'object' ||
      result.result === null ||
      !result.result.hasOwnProperty('nft')
    ) {
      return errorFxn(CatapultMiddlewareErrorCode.NO_REGISTERED_NFT);
    }
    const j = result.result as {
      nft: {
        address: string;
        token_id: string;
      };
    };

    const nft = j.nft;
    nftAddressVar = nft.address;
    nftTokenIdVar = parseInt(nft.token_id, 10);
    if (isNaN(nftTokenIdVar)) {
      // TODO: can the backend store a NaN somehow? Is it enforced to be an integer?
      return errorFxn(CatapultMiddlewareErrorCode.INVALID_RESPONSE_FROM_BACKEND);
    }
    ownershipQueryVar = indexerQueryHistoricalOwner(
      nftAddressVar,
      nftTokenIdVar,
      latestBlockHeight
    );
  } catch (err) {
    return errorFxn(CatapultMiddlewareErrorCode.ERROR_QUERYING_BACKEND_ENDPOINT, err);
  }

  const nftAddress = nftAddressVar;
  const nftTokenId = nftTokenIdVar;
  const ownershipQuery = ownershipQueryVar;

  // Verify NFT ownership with the indexer:
  try {
    const result = await indexerEndpointCall(ownershipQuery);
    if (!result.success) {
      return errorFxn(CatapultMiddlewareErrorCode.ERROR_QUERYING_INDEXER_ENDPOINT);
    }
    const verify = result.result as {
      success: boolean;
      result: UserAddress;
    };
    if (!verify.success) {
      return errorFxn(CatapultMiddlewareErrorCode.UNABLE_TO_VERIFY_NFT_OWNERSHIP);
    }
    if (verify.result.toLowerCase() !== wallet.toLowerCase()) {
      return errorFxn(CatapultMiddlewareErrorCode.NFT_OWNED_BY_DIFFERENT_ADDRESS);
    }
  } catch (err) {
    return errorFxn(CatapultMiddlewareErrorCode.ERROR_QUERYING_INDEXER_ENDPOINT, err);
  }

  // Fetch title and image of NFT and return result:
  try {
    const titleImageQuery = indexerQueryTitleImage(nftAddress, nftTokenId);
    const result = await indexerEndpointCall(titleImageQuery);
    if (!result.success) {
      return errorFxn(CatapultMiddlewareErrorCode.ERROR_QUERYING_INDEXER_ENDPOINT);
    }
    const j = result.result as {
      success: boolean;
      result: {
        title: string;
        image: URI;
      };
    };
    if (!j.success) {
      return errorFxn(CatapultMiddlewareErrorCode.NFT_TITLE_IMAGE_UNKNOWN);
    }
    const titleAndImage = j.result;
    return {
      success: true,
      result: {
        title: titleAndImage.title,
        imageUrl: titleAndImage.image,
        nftAddress: nftAddress,
        tokenId: nftTokenId,
      },
    };
  } catch (err) {
    return errorFxn(CatapultMiddlewareErrorCode.ERROR_QUERYING_INDEXER_ENDPOINT, err);
  }
}

async function getNewLobbies(
  wallet: string,
  blockHeight: number
): Promise<NewLobbies | FailedResult> {
  return getRawNewLobbies(wallet, blockHeight);
}

async function getUserLobbiesMatches(
  walletAddress: string,
  page: number,
  count?: number
): Promise<LobbyStates | FailedResult> {
  const errorFxn = buildEndpointErrorFxn('getUserLobbiesMatches');
  try {
    const query = backendQueryUserLobbies(walletAddress, count, page);
    const result = await backendEndpointCall(query);
    if (!result.success) {
      return errorFxn(CatapultMiddlewareErrorCode.ERROR_QUERYING_BACKEND_ENDPOINT);
    }
    const lobbies = result.result as { lobbies: LobbyState[] };
    return {
      success: true,
      ...lobbies,
    };
  } catch (err) {
    return errorFxn(CatapultMiddlewareErrorCode.ERROR_QUERYING_BACKEND_ENDPOINT, err);
  }
}

async function getOpenLobbies(page: number, count?: number): Promise<LobbyStates | FailedResult> {
  const errorFxn = buildEndpointErrorFxn('getOpenLobbies');
  try {
    const query = backendQueryOpenLobbies(count, page);
    const result = await backendEndpointCall(query);
    if (!result.success) {
      return errorFxn(CatapultMiddlewareErrorCode.ERROR_QUERYING_BACKEND_ENDPOINT);
    }
    const lobbies = result.result as { lobbies: LobbyState[] };
    return {
      success: true,
      ...lobbies,
    };
  } catch (err) {
    return errorFxn(CatapultMiddlewareErrorCode.ERROR_QUERYING_BACKEND_ENDPOINT);
  }
}

async function getRandomOpenLobby(): Promise<PackedLobbyState | FailedResult> {
  const errorFxn = buildEndpointErrorFxn('getRandomOpenLobby');
  try {
    return retryPromise(() => getNonemptyRandomOpenLobby(), RETRY_PERIOD_RANDOM_LOBBY, 1).catch(
      async err => {
        errorFxn(CatapultMiddlewareErrorCode.RANDOM_OPEN_LOBBY_FALLBACK, err);
        const openLobbies = await getOpenLobbies(1);
        if (openLobbies.success) {
          const count = openLobbies.lobbies.length;
          if (count === 0) {
            return errorFxn(CatapultMiddlewareErrorCode.NO_OPEN_LOBBIES);
          }
          const index = Math.floor(Math.random() * count);
          return {
            success: true,
            lobby: openLobbies.lobbies[index],
          };
        } else {
          return errorFxn(CatapultMiddlewareErrorCode.ERROR_QUERYING_BACKEND_ENDPOINT);
        }
      }
    );
  } catch (err) {
    return errorFxn(CatapultMiddlewareErrorCode.ERROR_QUERYING_BACKEND_ENDPOINT, err);
  }
}

async function getRoundExecutor(
  lobbyId: string,
  roundNumber: number
): Promise<SuccessfulResult<RoundExecutor> | FailedResult> {
  const errorFxn = buildEndpointErrorFxn('getRoundExecutor');

  // Retrieve data:
  let data: RoundExecutorData;
  try {
    const query = backendQueryRoundExecutor(lobbyId, roundNumber);
    const result = await backendEndpointCall(query);
    if (!result.success) {
      return errorFxn(CatapultMiddlewareErrorCode.ERROR_QUERYING_BACKEND_ENDPOINT);
    }
    data = result.result as RoundExecutorData;
  } catch (err) {
    return errorFxn(CatapultMiddlewareErrorCode.ERROR_QUERYING_BACKEND_ENDPOINT, err);
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
  let data: MatchExecutorData;
  try {
    const query = backendQueryMatchExecutor(lobbyId);
    const result = await backendEndpointCall(query);
    if (!result.success) {
      return errorFxn(CatapultMiddlewareErrorCode.ERROR_QUERYING_BACKEND_ENDPOINT);
    }
    data = result.result as MatchExecutorData;
  } catch (err) {
    return errorFxn(CatapultMiddlewareErrorCode.ERROR_QUERYING_BACKEND_ENDPOINT);
  }

  // Process data:
  try {
    const executor = await buildMatchExecutor(data);
    return {
      success: true,
      result: executor,
    };
  } catch (err) {
    return errorFxn(CatapultMiddlewareErrorCode.UNABLE_TO_BUILD_EXECUTOR);
  }
}

export const queryEndpoints = {
  getUserStats,
  getLobbyState,
  getRoundExecutionState,
  getRandomOpenLobby,
  getOpenLobbies,
  getUserLobbiesMatches,
  getUserWalletNfts,
  getLatestProcessedBlockHeight,
  getNewLobbies,
  getUserSetNFT,
  getRoundExecutor,
  getMatchExecutor,
};
