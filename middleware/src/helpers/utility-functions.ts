import { PaimaMiddlewareErrorCode, getDeployment, pushLog } from 'paima-engine/paima-mw-core';
import type {
  MatchExecutorData,
  MatchState,
  Structure,
  StructureConcise,
  TickEvent,
  TurnAction,
} from '@tower-defense/utils';
import { buildEndpointErrorFxn, MiddlewareErrorCode } from '../errors';
import type { LobbyState, NftScore, NftScoreSnake, PackedLobbyState, RoundEnd } from '../types';
import { getBlockTime } from 'paima-engine/paima-utils';
import { matchExecutor } from 'paima-engine/paima-executors';
import processTick, { parseConfig } from '@tower-defense/game-logic';

const conciseMap: Record<Structure, StructureConcise> = {
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
    errorFxn(PaimaMiddlewareErrorCode.INTERNAL_INVALID_DEPLOYMENT, err);
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
type MatchStats = {
  p1StructuresBuilt: number;
  p2StructuresBuilt: number;
  p1GoldSpent: number;
  p2GoldSpent: number;
  unitsSpawned: number;
  unitsDestroyed: number;
};
export function calculateMatchStats(data: MatchExecutorData): MatchStats {
  const p1isAttacker =
    data.lobby.lobby_creator === (data.lobby.current_match_state as unknown as MatchState).attacker;
  const config = parseConfig(data.configString);
  const m = matchExecutor.initialize(
    config,
    data.lobby.num_of_rounds,
    data.initialState,
    data.seeds,
    data.moves,
    processTick
  );
  let events: (TickEvent | { eventType: 'newRound' })[] = [];
  let run = true;
  while (run) {
    const tickEvents = m.tick();
    if (!tickEvents) run = false;
    else events = [...events, ...tickEvents];
  }
  const r = {
    defenderStructuresBuilt: 0,
    attackerStructuresBuilt: 0,
    unitsDestroyed: 0,
    unitsSpawned: 0,
    rounds: 1,
  };
  const rr = events.reduce((acc, e, i) => {
    if (e.eventType === 'spawn') return { ...acc, unitsSpawned: acc.unitsSpawned + 1 };
    if (e.eventType === 'actorDeleted' && e.faction === 'attacker') {
      const previous = events[i - 1];
      if (previous.eventType === 'defenderBaseUpdate') return acc;
      else return { ...acc, unitsDestroyed: acc.unitsDestroyed + 1 };
    }
    if (e.eventType === 'build' && e.faction === 'defender')
      return {
        ...acc,
        defenderStructuresBuilt: acc.defenderStructuresBuilt + 1,
      };
    if (e.eventType === 'build' && e.faction === 'attacker')
      return {
        ...acc,
        attackerStructuresBuilt: acc.attackerStructuresBuilt + 1,
      };
    else if (e.eventType === 'newRound') return { ...acc, rounds: acc.rounds + 1 };
    else return acc;
  }, r);
  if (p1isAttacker)
    return {
      p1StructuresBuilt: rr.attackerStructuresBuilt,
      p2StructuresBuilt: rr.defenderStructuresBuilt,
      p1GoldSpent: config.baseAttackerGoldRate * rr.rounds - m.currentState.attackerGold,
      p2GoldSpent: config.baseDefenderGoldRate * rr.rounds - m.currentState.defenderGold,
      unitsDestroyed: rr.unitsDestroyed,
      unitsSpawned: rr.unitsSpawned,
    };
  else
    return {
      p1StructuresBuilt: rr.defenderStructuresBuilt,
      p2StructuresBuilt: rr.attackerStructuresBuilt,
      p1GoldSpent: config.baseDefenderGoldRate * rr.rounds - m.currentState.defenderGold,
      p2GoldSpent: config.baseAttackerGoldRate * rr.rounds - m.currentState.attackerGold,
      unitsDestroyed: rr.unitsDestroyed,
      unitsSpawned: rr.unitsSpawned,
    };
}
