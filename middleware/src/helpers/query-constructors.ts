import { UserAddress } from '@tower-defense/utils';
import { QueryOptions, QueryValue } from '../types';

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
  for (const opt in options) {
    const valString = queryValueToString(options[opt]);
    optStrings.push(`${opt}=${valString}`);
  }
  if (optStrings.length === 0) {
    return endpoint;
  } else {
    return `${endpoint}?${optStrings.join('&')}`;
  }
}

const buildServerQuery = buildQuery;

function buildIndexerQuery(endpoint: string, options: QueryOptions): string {
  return 'api/v1/' + buildQuery(endpoint, options);
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

export function backendQueryLobbyState(lobbyID: string): string {
  const endpoint = 'lobby_state';
  const options = {
    lobbyID,
  };
  return buildServerQuery(endpoint, options);
}

export function backendQueryLobbyStatus(lobbyID: string): string {
  const endpoint = 'lobby_status';
  const options = {
    lobbyID,
  };
  return buildServerQuery(endpoint, options);
}

export function backendQueryLatestProcessedBlockHeight(): string {
  const endpoint = 'latest_processed_blockheight';
  const options = {};
  return buildServerQuery(endpoint, options);
}

export function backendQueryUserLobbiesBlockheight(
  wallet: UserAddress,
  blockHeight: number
): string {
  const endpoint = 'user_lobbies_blockheight';
  const options = {
    wallet,
    block_height: blockHeight,
  };
  return buildServerQuery(endpoint, options);
}

export function backendQueryRoundStatus(lobbyID: string, roundNumber: number): string {
  const endpoint = 'round_status';
  const options = {
    lobbyID,
    roundNumber,
  };
  return buildServerQuery(endpoint, options);
}

export function backendQueryUserStats(wallet: UserAddress): string {
  const endpoint = 'user_stats';
  const options = {
    wallet,
  };
  return buildServerQuery(endpoint, options);
}

export function backendQueryUserNft(wallet: UserAddress): string {
  const endpoint = 'user_nft';
  const options = {
    wallet,
  };
  return buildServerQuery(endpoint, options);
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
  return buildServerQuery(endpoint, options);
}

export function backendQueryOpenLobbies(count?: number, page?: number): string {
  const endpoint = 'open_lobbies';
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
  return buildServerQuery(endpoint, options);
}

export function backendQueryRoundExecutor(lobbyID: string, roundNumber: number): string {
  const endpoint = 'round_executor';
  const options = {
    lobbyID,
    roundNumber,
  };
  return buildServerQuery(endpoint, options);
}

export function backendQueryMatchExecutor(lobbyID: string): string {
  const endpoint = 'match_executor';
  const options = {
    lobbyID,
  };
  return buildServerQuery(endpoint, options);
}
