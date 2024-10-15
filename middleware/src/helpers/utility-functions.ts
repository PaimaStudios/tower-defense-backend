import { pushLog } from '@paima/mw-core';
import type {
  ActorsObject,
  MatchConfig,
  MatchExecutorData,
  MatchState,
  StructureType,
  StructureConcise,
  TickEvent,
  TurnAction,
  UpgradeTier,
  Structure,
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
import { matchExecutor } from '@paima/executors';
import processTick, { parseConfig } from '@tower-defense/game-logic';
import type { NewRoundEvent } from '@paima/executors/build/types';

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

function isTickEvents(events: TickEvent[] | NewRoundEvent[] | null): events is TickEvent[] {
  return events !== null && events.length > 0 && events[0].eventType !== 'newRound';
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
  const executor = matchExecutor.initialize(
    config,
    data.lobby.num_of_rounds,
    data.initialState,
    data.seeds,
    data.moves,
    processTick
  );
  let events: (TickEvent | { eventType: 'newRound' })[] = [];
  let run = true;
  let attackerUpgradesCost = 0;
  let defenderUpgradesCost = 0;
  while (run) {
    const tickEvents = executor.tick();
    if (!tickEvents) run = false;
    else events = [...events, ...tickEvents];

    const currentState = executor.currentState;
    if (isTickEvents(tickEvents)) {
      const upgrades = computeUpgradeCosts(tickEvents, currentState.actors, config);
      attackerUpgradesCost += upgrades.attackerUpgradesCost;
      defenderUpgradesCost += upgrades.defenderUpgradesCost;
    }
  }
  const initialStats = {
    defenderStructuresBuilt: 0,
    attackerStructuresBuilt: 0,
    attackerGoldSpent: attackerUpgradesCost,
    defenderGoldSpent: defenderUpgradesCost,
    unitsDestroyed: 0,
    unitsSpawned: 0,
    rounds: 1,
  };

  const stats = events.reduce((stats, event, i) => {
    // upgrade events calculated separately due to match state dependency
    switch (event.eventType) {
      case 'spawn':
        return { ...stats, unitsSpawned: stats.unitsSpawned + 1 };
      case 'actorDeleted':
        if (event.faction === 'attacker') {
          const previous = events[i - 1];
          if (previous.eventType === 'defenderBaseUpdate') return stats;
          else return { ...stats, unitsDestroyed: stats.unitsDestroyed + 1 };
        }
        return stats;
      case 'build':
        const buildCost = config[event.structure][1].price;
        return {
          ...stats,
          [`${event.faction}GoldSpent`]: stats[`${event.faction}GoldSpent`] + buildCost,
          [`${event.faction}StructuresBuilt`]: stats[`${event.faction}StructuresBuilt`] + 1,
        };
      case 'newRound':
        return { ...stats, rounds: stats.rounds + 1 };
      case 'repair':
        return {
          ...stats,
          [`${event.faction}GoldSpent`]: stats[`${event.faction}GoldSpent`] + config.repairCost,
        };
      default:
        return stats;
    }
  }, initialStats);

  if (p1isAttacker) {
    return {
      p1StructuresBuilt: stats.attackerStructuresBuilt,
      p2StructuresBuilt: stats.defenderStructuresBuilt,
      p1GoldSpent: stats.attackerGoldSpent,
      p2GoldSpent: stats.defenderGoldSpent,
      unitsDestroyed: stats.unitsDestroyed,
      unitsSpawned: stats.unitsSpawned,
    };
  }
  return {
    p1StructuresBuilt: stats.defenderStructuresBuilt,
    p2StructuresBuilt: stats.attackerStructuresBuilt,
    p1GoldSpent: stats.defenderGoldSpent,
    p2GoldSpent: stats.attackerGoldSpent,
    unitsDestroyed: stats.unitsDestroyed,
    unitsSpawned: stats.unitsSpawned,
  };
}

/**
 * Actors are in their final state (since upgrades are applied in single tick) so workaround for that is needed.
 * // TODO: Works only for 3 tiered structures, will need to be more generic if we introduce more
 * @param tickEvents
 * @param actors structures in their final state, after applying the events
 * @param config
 * @returns Computes the cost of upgrades for both factions based on provided events
 */
function computeUpgradeCosts(tickEvents: TickEvent[], actors: ActorsObject, config: MatchConfig) {
  const upgrades = tickEvents.reduce((upgrades, event) => {
    if (event.eventType === 'upgrade') {
      const toUpgrade =
        event.faction === 'attacker' ? actors.crypts[event.id] : actors.towers[event.id];
      if (upgrades.includes(toUpgrade)) {
        upgrades.push({ ...toUpgrade, upgrades: (toUpgrade.upgrades - 1) as UpgradeTier });
      } else {
        upgrades.push(toUpgrade);
      }
    }
    return upgrades;
  }, [] as Structure[]);

  return upgrades.reduce(
    (spentGold, upgrade) => {
      const cost = config[upgrade.structure][upgrade.upgrades].price;
      spentGold[`${upgrade.faction}UpgradesCost`] += cost;
      return spentGold;
    },
    { attackerUpgradesCost: 0, defenderUpgradesCost: 0 }
  );
}
