import type {
  ActorsObject,
  BuildStructureAction,
  Faction,
  MatchConfig,
  MatchState,
  Structure,
  StructureType,
  TurnAction,
  UpgradeStructureAction,
  UpgradeTier,
} from '@tower-defense/utils';
import { getPossibleStructures } from './utils';

/**
 * @returns completely random list of structures to build
 */
export function generateRandomMoves(
  matchConfig: MatchConfig,
  matchState: MatchState,
  faction: Faction,
  round: number
): TurnAction[] {
  const gold = faction === 'defender' ? matchState.defenderGold : matchState.attackerGold;
  const structures = getPossibleStructures(faction);
  const toBuild = chooseStructures(matchConfig, matchState, faction, round, gold, structures);
  return toBuild;
}

function chooseStructures(
  matchConfig: MatchConfig,
  matchState: MatchState,
  faction: Faction,
  round: number,
  budget: number,
  choices: StructureType[]
): BuildStructureAction[] {
  const usableTileIndices = matchState.map.reduce(
    (tiles, item, index) =>
      item.type === 'open' && item.faction === faction ? [...tiles, index] : tiles,
    [] as number[]
  );
  const actors = faction === 'attacker' ? matchState.actors.crypts : matchState.actors.towers;
  Object.values(actors).forEach(structure => {
    usableTileIndices.splice(usableTileIndices.indexOf(structure.coordinates), 1);
  });

  let currentBudget = budget;
  const actions: BuildStructureAction[] = [];
  while (currentBudget > 0) {
    const structure = choices[Math.floor(Math.random() * choices.length)];
    const price = matchConfig[structure][1].price;
    if (currentBudget < price || usableTileIndices.length === 0) break;

    const coordinates = usableTileIndices[Math.floor(Math.random() * usableTileIndices.length)];
    const action: BuildStructureAction = {
      action: 'build',
      structure,
      coordinates,
      faction,
      round,
    };

    actions.push(action);
    currentBudget -= price;
    usableTileIndices.splice(usableTileIndices.indexOf(coordinates), 1);
  }
  return actions;
}

function upgradeStructures(
  matchConfig: MatchConfig,
  actors: ActorsObject,
  faction: Faction,
  round: number,
  budget: number
): [UpgradeStructureAction[], number] {
  const structures = faction === 'attacker' ? actors.crypts : actors.towers;
  const possibleUpgrades: { cost: number; id: number }[] = Object.values(structures).reduce(
    (upgrades, actor: Structure) => {
      if (actor.upgrades === 3) return upgrades;

      //TODO: helper function
      const cost = matchConfig[actor.structure][(actor.upgrades + 1) as UpgradeTier].price;
      const nextTierUpgrade = { cost, id: actor.id };
      if (actor.upgrades === 1) {
        const tier3Cost = matchConfig[actor.structure][(actor.upgrades + 2) as UpgradeTier].price;
        return [...upgrades, nextTierUpgrade, { cost: tier3Cost, id: actor.id }];
      }
      return [...upgrades, nextTierUpgrade];
    },
    [] as { cost: number; id: number }[]
  );

  if (possibleUpgrades.length === 0) return [[], 0];

  let moneyLeft = budget;
  const actions: UpgradeStructureAction[] = [];
  while (moneyLeft > 0 && possibleUpgrades.length > 0) {
    const upgrade = possibleUpgrades.shift();
    if (!upgrade || moneyLeft < upgrade.cost) break;

    const action: UpgradeStructureAction = {
      action: 'upgrade',
      id: upgrade.id,
      round,
      faction,
    };
    actions.push(action);
    moneyLeft -= upgrade.cost;
  }
  return [actions, budget - moneyLeft];
}

export function generateBotMoves(
  matchConfig: MatchConfig,
  matchState: MatchState,
  faction: Faction,
  round: number
): TurnAction[] {
  const gold = matchState[`${faction}Gold`];
  const structures = getPossibleStructures(faction);

  const [upgrades, cost] = upgradeStructures(matchConfig, matchState.actors, faction, round, gold);
  return upgrades;
  // if (actors)
  //   const toBuild = chooseStructures(matchConfig, matchState, faction, round, gold, structures);
  // //1 upgrade as much as possible
  // //build:
  // ////defender - closest to base, with path coverage
  // ////attacker - on least busy lane

  // //utils - comparePath

  // return toBuild;
}

// export const calculatePathCoverage = (
