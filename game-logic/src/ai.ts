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

//TODO: add prando to these... (!)

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
  const actors = Object.values(matchState.actors[faction === 'attacker' ? 'crypts' : 'towers']);
  const availableTiles = getAvailableTiles(matchState.map, actors, faction);
  const toBuild = chooseStructures(matchConfig, faction, round, gold, availableTiles);
  return toBuild;
}

/**
 * @returns list of tiles where faction can build structures
 */
const getAvailableTiles = (map: Tile[], actors: Structure[], faction: Faction): number[] => {
  const occupiedTiles = new Set(actors.map(actor => actor.coordinates));
  const availableTiles = map
    .reduce(
      (tiles, item, index) =>
        item.type === 'open' && item.faction === faction ? [...tiles, index] : tiles,
      [] as number[]
    )
    .filter(cell => !occupiedTiles.has(cell));
  return availableTiles;
};

/**
 * @returns sorted list of tile indices with coverage representing number of path tiles in range
 */
const computePathCoverage = (
  mapState: MapState,
  tiles: number[],
  range: number
): TileCoverage[] => {
  const sortedTiles = tiles
    .map(cell => {
      const nearTiles = getSurroundingCells(cell, mapState.width, mapState.height, range);
      return {
        index: cell,
        coverage: nearTiles.filter(tile => mapState.map[tile].type === 'path').length,
      };
    })
    .sort((a, b) => b.coverage - a.coverage);
  return sortedTiles;
};
function chooseStructures(
  matchConfig: MatchConfig,
  faction: Faction,
  round: number,
  budget: number,
  availableTiles: number[]
): BuildStructureAction[] {
  const choices = getPossibleStructures(faction);

  let currentBudget = budget;
  const actions: BuildStructureAction[] = [];
  while (currentBudget > 0) {
    //TODO: add prando
    const structure = choices[Math.floor(Math.random() * choices.length)];
    const price = matchConfig[structure][1].price;
    if (currentBudget < price || availableTiles.length === 0) break;

    //TODO: add prando
    const coordinates = availableTiles[Math.floor(Math.random() * availableTiles.length)];
    const action: BuildStructureAction = {
      action: 'build',
      structure,
      coordinates,
      faction,
      round,
    };

    actions.push(action);
    currentBudget -= price;
    availableTiles.splice(availableTiles.indexOf(coordinates), 1);
  }
  return actions;
}

/**
 * @returns list of possible upgrades for existing structures and total cost of these actions
 */
function upgradeStructures(
  matchConfig: MatchConfig,
  actors: Structure[],
  faction: Faction,
  round: number,
  budget: number
): [UpgradeStructureAction[], number] {
  type Upgrade = { cost: number; id: number };
  const possibleUpgrades: Upgrade[] = actors.reduce((upgrades, actor: Structure) => {
    if (actor.upgrades === 3) return upgrades;

    //TODO: helper function
    const cost = matchConfig[actor.structure][(actor.upgrades + 1) as UpgradeTier].price;
    const nextTierUpgrade = { cost, id: actor.id };
    if (actor.upgrades === 1) {
      const tier3Cost = matchConfig[actor.structure][(actor.upgrades + 2) as UpgradeTier].price;
      return [...upgrades, nextTierUpgrade, { cost: tier3Cost, id: actor.id }];
    }
    return [...upgrades, nextTierUpgrade];
  }, [] as Upgrade[]);

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

/**
 * @returns list of structures to build on provided tiles and a total cost of these actions
 */
function placeStructures(
  matchConfig: MatchConfig,
  tiles: TileCoverage[],
  faction: Faction,
  round: number,
  budget: number
): [BuildStructureAction[], number] {
  const choices = getPossibleStructures(faction);

  let moneyLeft = budget;
  const actions: BuildStructureAction[] = [];
  while (moneyLeft > 0 && tiles.length > 0) {
    const tile = tiles.shift();
    //TODO: add prando
    const structure = choices[Math.floor(Math.random() * choices.length)];
    const price = matchConfig[structure][1].price;
    if (!tile || price > moneyLeft) break;

    const action: BuildStructureAction = {
      action: 'build',
      structure,
      coordinates: tile.index,
      faction,
      round,
    };
    actions.push(action);
    moneyLeft -= price;
  }
  return [actions, budget - moneyLeft];
}

const BASE_TILES_RANGE = 4;
// simplified range for bot purposes
const TOWER_RANGE = 2;
export function generateBotMoves(
  matchConfig: MatchConfig,
  matchState: MatchState,
  faction: Faction,
  round: number
): TurnAction[] {
  const gold = matchState[`${faction}Gold`];
  const actors = Object.values(matchState.actors[faction === 'attacker' ? 'crypts' : 'towers']);
  const occupiedTiles = new Set(actors.map(actor => actor.coordinates));

  const [upgrades, upgradesCost] = upgradeStructures(matchConfig, actors, faction, round, gold);
  console.log({ upgrades, upgradeCost: upgradesCost });

  //TODO: choose towers based on opponent structures
  if (faction === 'defender') {
    const { defenderBase, map, width, height } = matchState;
    const nearbyTiles = getSurroundingCells(
      defenderBase.coordinates,
      width,
      height,
      BASE_TILES_RANGE
    ).filter(cell => map[cell].type === 'open' && !occupiedTiles.has(cell));
    const preferredTiles = computePathCoverage({ map, width, height }, nearbyTiles, TOWER_RANGE);
    const [baseTowers, baseTowersCost] = placeStructures(
      matchConfig,
      preferredTiles,
      faction,
      round,
      gold - upgradesCost
    );
    console.log({ baseTowers, baseTowersCost });

    const moneyLeft = gold - upgradesCost - baseTowersCost;
    //ran out of base tiles or none were available in the first place
    if (moneyLeft > 0) {
      const allTiles = getAvailableTiles(matchState.map, actors, faction);
      const otherTiles = computePathCoverage({ map, width, height }, allTiles, TOWER_RANGE);
      const [otherTowers, otherTowersCost] = placeStructures(
        matchConfig,
        otherTiles,
        faction,
        round,
        moneyLeft
      );
      console.log({ otherTowers, otherTowersCost });
      return [...upgrades, ...baseTowers, ...otherTowers];
    }

    return [...upgrades, ...baseTowers];
  }
  if (faction === 'attacker') {
    //calculate paths from blocked tile neighbours to defender base
  }

  return [];
  // if (actors)
  //   const toBuild = chooseStructures(matchConfig, matchState, faction, round, gold, structures);
  // //1 upgrade as much as possible
  // //build:
  // ////defender - closest to base, with path coverage DONE
  // ////attacker - on least busy lane

  // //utils - comparePath

  // return toBuild;
}

// export const calculatePathCoverage = (
