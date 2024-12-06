import { matchExecutor, NewRoundEvent } from '@paima/executors';
import type { IGetLobbyByIdResult } from '@tower-defense/db';
import type { ActorsObject, MatchConfig, MatchExecutorData, MatchResults, MatchState, Result, Structure, TickEvent, UpgradeTier } from '@tower-defense/utils';
import { parseConfig } from './config.js';
import processTick from './processTick.js';
export default processTick;
export { generateBotMoves, generateMoves, generateRandomMoves } from './ai.js';
export { baseConfig, conciseFactionMap, parseConfig } from './config.js';
export { generateMatchState, getMap } from './map-processor.js';
export { validateMoves } from './validation.js';

const calculateResult = (isAttacker: boolean, defenderSurvived: boolean): Result => {
  return isAttacker ? (defenderSurvived ? 'loss' : 'win') : defenderSurvived ? 'win' : 'loss';
};

export function winnerOf(lobby: IGetLobbyByIdResult): string | null {
  const matchState = lobby.current_match_state as unknown as MatchState;
  const p1isAttacker = matchState.attacker === lobby.lobby_creator;
  const defenderSurvived = matchState.defenderBase.health > 0;
  return p1isAttacker ? (defenderSurvived ? lobby.player_two : lobby.lobby_creator) : defenderSurvived ? lobby.lobby_creator : lobby.player_two;
}

export function matchResults(lobby: IGetLobbyByIdResult, matchState: MatchState): MatchResults {
  const p1isAttacker = matchState.attacker === lobby.lobby_creator;
  const defenderSurvived = matchState.defenderBase.health > 0;
  // Save the final user states in the final state table
  const [p1Gold, p2Gold] = p1isAttacker
    ? [matchState.attackerGold, matchState.defenderGold]
    : [matchState.defenderGold, matchState.attackerGold];
  const [p1Token, p2Token] = p1isAttacker
    ? [matchState.attackerTokenId, matchState.defenderTokenId]
    : [matchState.defenderTokenId, matchState.attackerTokenId];

  const p1Result = calculateResult(p1isAttacker, defenderSurvived);
  const p2Result = p1Result === 'win' ? 'loss' : 'win';

  return [
    {
      result: p1Result,
      gold: p1Gold,
      wallet: lobby.lobby_creator,
      tokenId: p1Token,
    },
    {
      result: p2Result,
      gold: p2Gold,
      wallet: lobby.player_two!,
      tokenId: p2Token,
    },
  ];
}

export type MatchStats = {
  p1StructuresBuilt: number;
  p2StructuresBuilt: number;
  p1GoldSpent: number;
  p2GoldSpent: number;
  unitsSpawned: number;
  unitsDestroyed: number;
  towersDestroyed: number;
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
    towersDestroyed: 0,
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
        } else if (event.faction === 'defender') {
          return { ...stats, towersDestroyed: stats.towersDestroyed + 1 };
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
      towersDestroyed: stats.towersDestroyed,
    };
  } else {
    return {
      p1StructuresBuilt: stats.defenderStructuresBuilt,
      p2StructuresBuilt: stats.attackerStructuresBuilt,
      p1GoldSpent: stats.defenderGoldSpent,
      p2GoldSpent: stats.attackerGoldSpent,
      unitsDestroyed: stats.unitsDestroyed,
      unitsSpawned: stats.unitsSpawned,
      towersDestroyed: stats.towersDestroyed,
    };
  }
}

function isTickEvents(events: TickEvent[] | NewRoundEvent[] | null): events is TickEvent[] {
  return events !== null && events.length > 0 && events[0].eventType !== 'newRound';
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
