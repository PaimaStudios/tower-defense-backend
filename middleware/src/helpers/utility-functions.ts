import { pushLog } from '@paima/mw-core';
import type {
  StructureType,
  StructureConcise, TurnAction
} from '@tower-defense/utils';
import { GameENV } from '@tower-defense/utils';
import { buildEndpointErrorFxn, MiddlewareErrorCode } from '../errors';
import type {
  LobbyState,
  NftScore,
  NftScoreSnake,
  PackedLobbyResponse,
  PackedLobbyState,
  RoundEnd,
} from '../types';

const conciseMap: Record<StructureType, StructureConcise> = {
  anacondaTower: 'at',
  piranhaTower: 'pt',
  slothTower: 'st',
  gorillaCrypt: 'gc',
  jaguarCrypt: 'jc',
  macawCrypt: 'mc',
};

export function moveToString(move: TurnAction): string {
  switch (move.action) {
    case 'build':
      const conciseStructure = conciseMap[move.structure];
      if (!conciseStructure) {
        pushLog('[moveToString] found move with invalid structure:', move.structure);
        throw new Error(`Invalid move submitted: ${move}`);
      }
      return `b${move.coordinates},${conciseStructure}`;
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

export function hasLobby(lobby: PackedLobbyResponse): lobby is PackedLobbyState {
  return lobby.lobby !== null;
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

  const blocksToEnd = roundEnd - current;
  return {
    blocks: roundEnd - current,
    seconds: blocksToEnd * GameENV.BLOCK_TIME,
  };
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
