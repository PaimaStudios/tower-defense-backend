import type { QueryOptions } from 'paima-engine/paima-mw-core';
import { buildBackendQuery, buildQuery } from 'paima-engine/paima-mw-core';
import { WalletAddress } from 'paima-engine/paima-utils';

import { getIndexerUri, getStatefulUri } from '../state';

function buildIndexerQuery(endpoint: string, options: QueryOptions): string {
  return `${getIndexerUri()}/api/v1/${buildQuery(endpoint, options)}`;
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
  wallet: WalletAddress,
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
  wallet: WalletAddress,
  blockHeight: number
): string {
  const endpoint = 'user_lobbies_blockheight';
  const options = {
    wallet,
    blockHeight,
  };
  return buildBackendQuery(endpoint, options);
}

export function backendQueryLobbyConfig(lobbyID: string): string {
  const endpoint = 'config';
  const options = {
    lobbyID,
  };
  return buildBackendQuery(endpoint, options);
}
export function backendQueryCurrentRound(lobbyID: string): string {
  const endpoint = 'current_round';
  const options = {
    lobbyID,
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

export function backendQueryUserStats(wallet: WalletAddress): string {
  const endpoint = 'user_stats';
  const options = {
    wallet,
  };
  return buildBackendQuery(endpoint, options);
}

export function backendQueryUserNft(wallet: WalletAddress): string {
  const endpoint = 'user_nft';
  const options = {
    wallet,
  };
  return buildBackendQuery(endpoint, options);
}

export function backendQueryUserLobbies(
  wallet: WalletAddress,
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
  wallet: WalletAddress,
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
