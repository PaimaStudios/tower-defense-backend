import { getDeployment, pushLog } from 'paima-engine/paima-mw-core';
import type { Structure, TurnAction } from '@tower-defense/utils';
import { GameENV } from '@tower-defense/utils';
import type { LobbyWebserverQuery, UserNft } from '../types';
import { buildEndpointErrorFxn, MiddlewareErrorCode } from '../errors';
import type {
  IndexerNftOwnership,
  LobbyState,
  NftScore,
  NftScoreSnake,
  PackedLobbyState,
  RoundEnd,
} from '../types';
import { getBlockTime } from 'paima-engine/paima-utils';

export function moveToString(move: TurnAction): string {
  switch (move.action) {
    case 'build':
      return `b${move.coordinates},${conciseStructure(move.structure)}`;
    case 'repair':
      return `r${move.id}`;
    case 'upgrade':
      return `u${move.id}`;
    case 'salvage':
      return `s${move.id}`;
    default:
      pushLog('[moveToString] found move with invalid type:', move);
      throw new Error(`Invalid move submitted: ${move}`);
  }
}
function conciseStructure(s: Structure): string {
  if (s === 'anacondaTower') return 'at';
  else if (s === 'piranhaTower') return 'pt';
  else if (s === 'slothTower') return 'st';
  else if (s === 'gorillaCrypt') return 'gc';
  else if (s === 'jaguarCrypt') return 'jc';
  else if (s === 'macawCrypt') return 'mc';
  else return 'mc'; // error message?
}

export function userJoinedLobby(address: String, lobby: PackedLobbyState): boolean {
  if (!lobby.hasOwnProperty('lobby')) {
    return false;
  }
  const l: LobbyState = lobby.lobby;

  if (!l.hasOwnProperty('player_two')) {
    return false;
  }
  if (!l.player_two || !address) {
    return false;
  }
  return l.player_two.toLowerCase() === address.toLowerCase();
}

export function userCreatedLobby(address: String, lobby: PackedLobbyState): boolean {
  if (!lobby.hasOwnProperty('lobby')) {
    return false;
  }
  const l: LobbyState = lobby.lobby;

  if (!l.hasOwnProperty('lobby_creator')) {
    return false;
  }
  if (!l.lobby_creator || !address) {
    return false;
  }
  return l.lobby_creator.toLowerCase() === address.toLowerCase();
}

export function lobbyWasClosed(lobby: PackedLobbyState): boolean {
  const { lobby: lobbyState } = lobby;
  if (!lobbyState) {
    return false;
  }

  return lobbyState.lobby_state === 'closed';
}

export function calculateRoundEnd(
  roundStart: number,
  roundLength: number,
  current: number
): RoundEnd {
  const errorFxn = buildEndpointErrorFxn('calculateRoundEnd');

  let roundEnd = roundStart + roundLength;
  if (roundEnd < current) {
    errorFxn(MiddlewareErrorCode.CALCULATED_ROUND_END_IN_PAST);
    roundEnd = current;
  }

  try {
    const blocksToEnd = roundEnd - current;
    const secsPerBlock = getBlockTime(getDeployment());
    const secondsToEnd = blocksToEnd * secsPerBlock;
    return {
      blocks: blocksToEnd,
      seconds: secondsToEnd,
    };
  } catch (err) {
    errorFxn(MiddlewareErrorCode.INTERNAL_INVALID_DEPLOYMENT, err);
    return {
      blocks: 0,
      seconds: 0,
    };
  }
}

export function nftScoreSnakeToCamel(nftScore: NftScoreSnake): NftScore {
  return {
    nftContract: nftScore.nft_contract,
    tokenId: nftScore.token_id,
    totalGames: nftScore.total_games,
    wins: nftScore.wins,
    draws: nftScore.draws,
    losses: nftScore.losses,
    score: nftScore.score,
  };
}

export function userNftIndexerToMiddleware(nft: IndexerNftOwnership): UserNft {
  return {
    wallet: nft.owner,
    nftContract: nft.contract,
    tokenId: nft.tokenId,
  };
}

export function lobbiesToTokenIdSet(lobbies: LobbyWebserverQuery[]): number[] {
  const s = new Set<number>([]);
  // NOTE: All NFTs are expected to be of the same contract
  for (const lobby of lobbies) {
    if (lobby.nft.nftContract === GameENV.NFT_CONTRACT && lobby.nft.tokenId) {
      s.add(lobby.nft.tokenId);
    }
  }
  return Array.from(s);
}
