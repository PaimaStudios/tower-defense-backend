import {
  ContractAddress,
  gameBackendVersion,
  NFT_CONTRACT,
  UserAddress,
} from '@tower-defense/utils';
import { LobbyWebserverQuery, RichOpenLobbyState, UserNft } from '../types';
import { buildEndpointErrorFxn, CatapultMiddlewareErrorCode } from '../errors';
import {
  FailedResult,
  IndexerNftOwnership,
  LobbyState,
  NewLobbies,
  NewLobby,
  NFT,
  NftId,
  NftScore,
  PackedLobbyState,
  StatefulNftId,
  SuccessfulResult,
} from '../types';
import {
  lobbiesToTokenIdSet,
  nftScoreSnakeToCamel,
  userCreatedLobby,
  userJoinedLobby,
  userNftIndexerToMiddleware,
} from './data-processing';
import { postDataToEndpoint } from './general';
import { pushLog } from './logging';
import {
  backendQueryBackendVersion,
  backendQueryLatestProcessedBlockHeight,
  backendQueryLobbyState,
  backendQueryUserLobbiesBlockheight,
  backendQueryUserNft,
  indexerQueryHistoricalOwner,
  indexerQueryHistoricalOwnerMultiple,
  indexerQueryTitleImage,
  statefulQueryMultipleNftScores,
  statefulQueryNftScore,
} from './query-constructors';

export async function getRawLobbyState(lobbyID: string): Promise<PackedLobbyState | FailedResult> {
  const errorFxn = buildEndpointErrorFxn('getRawLobbyState');

  let res: Response;
  try {
    const query = backendQueryLobbyState(lobbyID);
    res = await fetch(query);
  } catch (err) {
    return errorFxn(CatapultMiddlewareErrorCode.ERROR_QUERYING_BACKEND_ENDPOINT, err);
  }

  try {
    const j = (await res.json()) as { lobby: LobbyState };
    // TODO: properly typecheck
    return {
      success: true,
      lobby: j.lobby,
    };
  } catch (err) {
    return errorFxn(CatapultMiddlewareErrorCode.INVALID_RESPONSE_FROM_BACKEND, err);
  }
}

export async function getRawLatestProcessedBlockHeight(): Promise<
  SuccessfulResult<number> | FailedResult
> {
  const errorFxn = buildEndpointErrorFxn('getRawLatestProcessedBlockHeight');

  let res: Response;
  try {
    const query = backendQueryLatestProcessedBlockHeight();
    res = await fetch(query);
  } catch (err) {
    return errorFxn(CatapultMiddlewareErrorCode.ERROR_QUERYING_BACKEND_ENDPOINT, err);
  }

  try {
    const j = (await res.json()) as { block_height: number };
    // TODO: properly typecheck
    return {
      success: true,
      result: j.block_height,
    };
  } catch (err) {
    return errorFxn(CatapultMiddlewareErrorCode.INVALID_RESPONSE_FROM_BACKEND, err);
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
    return errorFxn(CatapultMiddlewareErrorCode.ERROR_QUERYING_BACKEND_ENDPOINT, err);
  }

  try {
    const j = (await res.json()) as { lobbies: NewLobby[] };
    // TODO: properly typecheck
    return {
      success: true,
      lobbies: j.lobbies,
    };
  } catch (err) {
    return errorFxn(CatapultMiddlewareErrorCode.INVALID_RESPONSE_FROM_BACKEND, err);
  }
}

// TODO: reworking this to use serverEndpointCall requires the endpoint to return a JSON
//       also purposefully not using a query constructor for extra differentiation
export async function getRemoteBackendVersion(): Promise<string> {
  const errorFxn = buildEndpointErrorFxn('getRemoteBackendVersion');

  let res: Response;
  try {
    const query = backendQueryBackendVersion();
    res = await fetch(query);
  } catch (err) {
    errorFxn(CatapultMiddlewareErrorCode.ERROR_QUERYING_BACKEND_ENDPOINT, err);
    throw err;
  }

  try {
    const versionString = await res.text();
    if (versionString[0] !== '"' || versionString[versionString.length - 1] !== '"') {
      throw new Error('Invalid version string: ' + versionString);
    }
    return versionString.slice(1, versionString.length - 1);
  } catch (err) {
    errorFxn(CatapultMiddlewareErrorCode.INVALID_RESPONSE_FROM_BACKEND, err);
    throw err;
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
    return errorFxn(CatapultMiddlewareErrorCode.ERROR_QUERYING_BACKEND_ENDPOINT, err);
  }

  try {
    const j = await res.json();
    const nftAddress: ContractAddress = j.nft.address;
    const tokenId: number = parseInt(j.nft.token_id, 10);
    if (isNaN(tokenId)) {
      // TODO: can the backend store a NaN somehow? Is it enforced to be an integer?
      return errorFxn(CatapultMiddlewareErrorCode.INVALID_RESPONSE_FROM_BACKEND);
    }
    return {
      success: true,
      result: {
        nftAddress,
        tokenId,
      },
    };
  } catch (err) {
    return errorFxn(CatapultMiddlewareErrorCode.INVALID_RESPONSE_FROM_BACKEND, err);
  }
}

export async function verifyNft(
  nftId: NftId,
  address: UserAddress,
  latestBlockHeight: number
): Promise<SuccessfulResult<true> | FailedResult> {
  const errorFxn = buildEndpointErrorFxn('verifyNft');

  let res: Response;

  try {
    const query = indexerQueryHistoricalOwner(nftId.nftAddress, nftId.tokenId, latestBlockHeight);
    res = await fetch(query);
  } catch (err) {
    return errorFxn(CatapultMiddlewareErrorCode.ERROR_QUERYING_INDEXER_ENDPOINT, err);
  }

  try {
    const j = await res.json();
    // TODO: properly type check
    if (!j.success) {
      return errorFxn(CatapultMiddlewareErrorCode.UNABLE_TO_VERIFY_NFT_OWNERSHIP);
    }
    if (j.result.toLowerCase() !== address.toLowerCase()) {
      return errorFxn(CatapultMiddlewareErrorCode.NFT_OWNED_BY_DIFFERENT_ADDRESS);
    }
  } catch (err) {
    return errorFxn(CatapultMiddlewareErrorCode.INVALID_RESPONSE_FROM_INDEXER, err);
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
    return errorFxn(CatapultMiddlewareErrorCode.ERROR_QUERYING_INDEXER_ENDPOINT, err);
  }

  try {
    const j = await res.json();
    if (!j.success) {
      return errorFxn(CatapultMiddlewareErrorCode.NFT_TITLE_IMAGE_UNKNOWN);
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
    return errorFxn(CatapultMiddlewareErrorCode.INVALID_RESPONSE_FROM_INDEXER, err);
  }
}

export async function fetchAndVerifyNft(address: UserAddress, blockHeight: number): Promise<NftId> {
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
    return errorFxn(CatapultMiddlewareErrorCode.ERROR_QUERYING_STATEFUL_ENDPOINT, err);
  }

  try {
    const j = (await res.json()).data;
    return {
      success: true,
      result: nftScoreSnakeToCamel(j),
    };
  } catch (err) {
    return errorFxn(CatapultMiddlewareErrorCode.INVALID_RESPONSE_FROM_STATEFUL, err);
  }
}

async function fetchMultipleNftScores(
  nftIds: StatefulNftId[]
): Promise<SuccessfulResult<NftScore[]> | FailedResult> {
  const errorFxn = buildEndpointErrorFxn('fetchMultipleNftScores');

  let res: Response;
  try {
    const query = statefulQueryMultipleNftScores();
    const body = JSON.stringify({ nfts: nftIds });
    res = await postDataToEndpoint(query, body);
  } catch (err) {
    return errorFxn(CatapultMiddlewareErrorCode.ERROR_QUERYING_STATEFUL_ENDPOINT, err);
  }

  try {
    const j = await res.json();
    const nftScores: NftScore[] = j.data.map(nftScoreSnakeToCamel);
    return {
      success: true,
      result: nftScores,
    };
  } catch (err) {
    return errorFxn(CatapultMiddlewareErrorCode.INVALID_RESPONSE_FROM_STATEFUL, err);
  }
}

async function fetchMultipleNftOwners(
  tokenIds: number[],
  blockHeight: number
): Promise<SuccessfulResult<UserNft[]> | FailedResult> {
  const errorFxn = buildEndpointErrorFxn('fetchMultipleNftOwners');

  let res: Response;
  try {
    const query = indexerQueryHistoricalOwnerMultiple();
    const body = JSON.stringify({
      contract: NFT_CONTRACT,
      blockHeight,
      tokenIds,
    });
    res = await postDataToEndpoint(query, body);
  } catch (err) {
    return errorFxn(CatapultMiddlewareErrorCode.ERROR_QUERYING_INDEXER_ENDPOINT, err);
  }

  try {
    const j = await res.json();
    if (!j.success) {
      return errorFxn(CatapultMiddlewareErrorCode.INVALID_RESPONSE_FROM_INDEXER);
    }
    const nfts: UserNft[] = j.result.map(userNftIndexerToMiddleware);
    return {
      success: true,
      result: nfts,
    };
  } catch (err) {
    return errorFxn(CatapultMiddlewareErrorCode.INVALID_RESPONSE_FROM_INDEXER, err);
  }
}

export async function addLobbyCreatorNftStats(
  lobbies: LobbyWebserverQuery[],
  blockHeight: number
): Promise<RichOpenLobbyState[]> {
  // NOTE: All NFTs are expected to be of the same contract
  const tokenIds = lobbiesToTokenIdSet(lobbies);
  const resVerification = await fetchMultipleNftOwners(tokenIds, blockHeight);
  if (!resVerification.success) {
    throw new Error('Error while verifying lobby creator NFT ownership');
  }

  const nftIds: StatefulNftId[] = resVerification.result.map(nft => ({
    nft_contract: nft.nftContract || NFT_CONTRACT,
    token_id: nft.tokenId || 0,
  }));
  const resScores = await fetchMultipleNftScores(nftIds);
  if (!resScores.success) {
    throw new Error('Error while retrieving lobby creator NFT scores');
  }
  if (resVerification.result.length !== resScores.result.length) {
    throw new Error('Invalid response from stateful indexer');
  }

  const zippedResults = resVerification.result.map((nft, index) => ({
    nft,
    score: resScores.result[index],
  }));

  const nftContract = NFT_CONTRACT.toLowerCase();

  return lobbies.map(lobby => {
    if (lobby.nft.nftContract?.toLowerCase() === nftContract) {
      const result = zippedResults.find(res => res.nft.tokenId === lobby.nft.tokenId);
      if (result && lobby.nft.wallet.toLowerCase() === result.nft.wallet.toLowerCase()) {
        return {
          ...lobby.lobby,
          wins: result.score.wins,
          ties: result.score.draws,
          losses: result.score.losses,
        };
      }
    }

    return {
      ...lobby.lobby,
      wins: 0,
      ties: 0,
      losses: 0,
    };
  });
}

// Waits until awaitedBlock has been processed by the backend
export async function awaitBlock(awaitedBlock: number): Promise<void> {
  const BLOCK_DELAY = 1000;
  let currentBlock: number;

  function waitLoop() {
    setTimeout(async () => {
      const res = await getRawLatestProcessedBlockHeight();
      if (res.success) {
        currentBlock = res.result;
      }
      if (!res.success || currentBlock < awaitedBlock) {
        waitLoop();
      }
    }, BLOCK_DELAY);
  }

  waitLoop();
}

export async function localRemoteVersionsCompatible(): Promise<boolean> {
  const localVersion = gameBackendVersion;
  const remoteVersion = await getRemoteBackendVersion();

  const localComponents = localVersion.split('.').map(parseInt);
  const remoteComponents = remoteVersion.split('.').map(parseInt);

  pushLog('Middleware version:', localVersion);
  pushLog('Backend version:   ', remoteVersion);

  if (localComponents[0] !== remoteComponents[0]) {
    return false;
  } else {
    return true;
  }
}
