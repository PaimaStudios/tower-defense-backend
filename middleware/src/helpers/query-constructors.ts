import { UserAddress } from '@tower-defense/utils';

import { getBackendUri, getBatcherUri, getIndexerUri, getStatefulUri } from '../state';
import { QueryOptions, QueryValue, StatefulNftId } from '../types';

function queryValueToString(value: QueryValue): string {
  if (typeof value === 'string') {
    return value;
  } else if (typeof value === 'number') {
    return value.toString(10);
  } else if (typeof value === 'boolean') {
    return value.toString();
  } else {
    throw new Error('[queryValueToString] Invalid query value');
  }
}

function buildQuery(endpoint: string, options: QueryOptions): string {
  const optStrings: string[] = [];
  for (let opt in options) {
    const valString = queryValueToString(options[opt]);
    optStrings.push(`${opt}=${valString}`);
  }
  if (optStrings.length === 0) {
    return endpoint;
  } else {
    return `${endpoint}?${optStrings.join('&')}`;
  }
}

function buildBackendQuery(endpoint: string, options: QueryOptions): string {
  return `${getBackendUri()}/${buildQuery(endpoint, options)}`;
}

function buildIndexerQuery(endpoint: string, options: QueryOptions): string {
  return `${getIndexerUri()}/api/v1/${buildQuery(endpoint, options)}`;
}

function buildBatcherQuery(endpoint: string, options: QueryOptions): string {
  return `${getBatcherUri()}/${buildQuery(endpoint, options)}`;
}

function buildStatefulQuery(endpoint: string, options: QueryOptions): string {
  return `${getStatefulUri()}/${buildQuery(endpoint, options)}`;
}

export function indexerQueryAccountNfts(account: string, size?: number, page?: number): string {
  const endpoint = 'account-nfts';
  const optsStart: QueryOptions = {};
  if (typeof size !== 'undefined') {
    optsStart.size = size;
  }
  if (typeof page !== 'undefined') {
    optsStart.page = page;
  }
  const options = {
    ...optsStart,
    metadata: true,
    traits: false,
    account,
  };
  return buildIndexerQuery(endpoint, options);
}

export function indexerQueryHistoricalOwner(
  contract: string,
  tokenId: number,
  blockHeight: number
): string {
  const endpoint = 'historical-owner';
  const options = {
    contract,
    tokenId,
    blockHeight,
  };
  return buildIndexerQuery(endpoint, options);
}

export function indexerQueryTitleImage(contract: string, tokenId: number): string {
  const endpoint = 'title-image';
  const options = {
    tokenId,
    contract,
  };
  return buildIndexerQuery(endpoint, options);
}

export function indexerQueryHistoricalOwnerMultiple(): string {
  const endpoint = 'historical-owner-multiple';
  const options = {};
  return buildIndexerQuery(endpoint, options);
}

export function backendQueryLobbyState(lobbyID: string): string {
  const endpoint = 'lobby_state';
  const options = {
    lobbyID,
  };
  return buildBackendQuery(endpoint, options);
}

export function backendQuerySearchLobby(
  wallet: UserAddress,
  searchQuery: string,
  page: number,
  count?: number
): string {
  const endpoint = 'search_open_lobbies';
  const options: QueryOptions = { wallet, searchQuery, page };
  if (count !== undefined) {
    options.count = count;
  }

  return buildBackendQuery(endpoint, options);
}

export function backendQueryLatestProcessedBlockHeight(): string {
  const endpoint = 'latest_processed_blockheight';
  const options = {};
  return buildBackendQuery(endpoint, options);
}

export function backendQueryUserLobbiesBlockheight(
  wallet: UserAddress,
  blockHeight: number
): string {
  const endpoint = 'user_lobbies_blockheight';
  const options = {
    wallet,
    blockHeight,
  };
  return buildBackendQuery(endpoint, options);
}

export function backendQueryRoundStatus(lobbyID: string, round: number): string {
  const endpoint = 'round_status';
  const options = {
    lobbyID,
    round,
  };
  return buildBackendQuery(endpoint, options);
}

export function backendQueryUserStats(wallet: UserAddress): string {
  const endpoint = 'user_stats';
  const options = {
    wallet,
  };
  return buildBackendQuery(endpoint, options);
}

export function backendQueryUserNft(wallet: UserAddress): string {
  const endpoint = 'user_nft';
  const options = {
    wallet,
  };
  return buildBackendQuery(endpoint, options);
}

export function backendQueryUserLobbies(
  wallet: UserAddress,
  count?: number,
  page?: number
): string {
  const endpoint = 'user_lobbies';
  const optsStart: QueryOptions = {};
  if (typeof count !== 'undefined') {
    optsStart.count = count;
  }
  if (typeof page !== 'undefined') {
    optsStart.page = page;
  }
  const options = {
    wallet,
    ...optsStart,
  };
  return buildBackendQuery(endpoint, options);
}

export function backendQueryOpenLobbies(
  wallet: UserAddress,
  count?: number,
  page?: number
): string {
  const endpoint = 'open_lobbies';
  const options: QueryOptions = { wallet };
  if (typeof count !== 'undefined') {
    options.count = count;
  }
  if (typeof page !== 'undefined') {
    options.page = page;
  }
  return buildBackendQuery(endpoint, options);
}

export function backendQueryRoundExecutor(lobbyID: string, round: number): string {
  const endpoint = 'round_executor';
  const options = {
    lobbyID,
    round,
  };
  return buildBackendQuery(endpoint, options);
}

export function backendQueryMatchExecutor(lobbyID: string): string {
  const endpoint = 'match_executor';
  const options = {
    lobbyID,
  };
  return buildBackendQuery(endpoint, options);
}

export function backendQueryRandomLobby(): string {
  const endpoint = 'random_lobby';
  const options = {};
  return buildBackendQuery(endpoint, options);
}

export function backendQueryMatchWinner(lobbyID: string): string {
  const endpoint = 'match_winner';
  const options = {
    lobbyID,
  };
  return buildBackendQuery(endpoint, options);
}
export function backendQueryMapByName(mapName: string): string {
  const endpoint = 'map_layout';
  const options = {
    mapName,
  };
  return buildBackendQuery(endpoint, options);
}

export function backendQueryBackendVersion(): string {
  const endpoint = 'backend_version';
  const options = {};
  return buildBackendQuery(endpoint, options);
}

export function batcherQuerySubmitUserInput(): string {
  const endpoint = 'submit_user_input';
  const options = {};
  return buildBatcherQuery(endpoint, options);
}

export function batcherQueryTrackUserInput(inputHash: string): string {
  const endpoint = 'track_user_input';
  const options = {
    input_hash: inputHash,
  };
  return buildBatcherQuery(endpoint, options);
}

export function statefulQueryStatelessNftsRanking(count?: number, page?: number): string {
  const endpoint = 'stateless-nfts-ranking';
  const optsStart: QueryOptions = {};
  if (typeof count !== 'undefined') {
    optsStart.count = count;
  }
  if (typeof page !== 'undefined') {
    optsStart.page = page;
  }
  const options = {
    ...optsStart,
  };
  return buildStatefulQuery(endpoint, options);
}

export function statefulQueryNftScore(nftContract: string, tokenId: number): string {
  const endpoint = 'nft-score';
  const options = {
    nft_contract: nftContract,
    token_id: tokenId,
  };
  return buildStatefulQuery(endpoint, options);
}

export function statefulQueryMultipleNftScores(): string {
  const endpoint = 'multiple-nft-scores';
  const options = {};
  return buildStatefulQuery(endpoint, options);
}
