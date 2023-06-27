import type {
  BuildStructureAction,
  Faction,
  MapState,
  MatchConfig,
  MatchState,
  Structure,
  StructureType,
  Tile,
  TurnAction,
  UpgradeStructureAction,
  UpgradeTier,
} from '@tower-defense/utils';
import {
  calculatePath,
  findCloseBySpawnTile,
  getPossibleStructures,
  getSurroundingCells,
} from './utils';

type PathCoverage = {
  index: number;
  coverage: number;
};


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

export const getMinStructureCost = (matchConfig: MatchConfig, faction: Faction): number => {
  const structures = getPossibleStructures(faction);
  const minCost = Math.min(...structures.map(structure => matchConfig[structure][1].price));
  return minCost;
};

/**
 * @returns sorted list of tile indices with coverage representing number of path tiles in range
 */
const computePathCoverage = (
  mapState: MapState,
  tiles: number[],
  range: number
): PathCoverage[] => {
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
function placeDefenderStructures(
  matchConfig: MatchConfig,
  tiles: PathCoverage[],
  round: number,
  budget: number
): [BuildStructureAction[], number] {
  const choices = getPossibleStructures('defender');

  let moneyLeft = budget;
  const actions: BuildStructureAction[] = [];
  while (moneyLeft > 0 && tiles.length > 0) {
    const tile = tiles.shift();
    //TODO: based on match state
    const structure = choices[Math.floor(Math.random() * choices.length)];
    const price = matchConfig[structure][1].price;
    if (!tile || price > moneyLeft) break;

    const action: BuildStructureAction = {
      action: 'build',
      structure,
      coordinates: tile.index,
      faction: 'defender',
      round,
    };
    actions.push(action);
    moneyLeft -= price;
  }
  return [actions, budget - moneyLeft];
}

/**
 * @returns list of structures to build on provided tiles and a total cost of these actions
 */
function placeAttackerStructures(
  matchConfig: MatchConfig,
  tiles: number[],
  round: number,
  budget: number
): [BuildStructureAction[], number] {
  const choices = getPossibleStructures('attacker');

  let moneyLeft = budget;
  const actions: BuildStructureAction[] = [];
  while (moneyLeft > 0 && tiles.length > 0) {
    //TODO: add prando
    const tile = tiles[Math.floor(Math.random() * tiles.length)];
    //TODO: based on match state
    const structure = choices[Math.floor(Math.random() * choices.length)];
    const price = matchConfig[structure][1].price;
    if (!tile || price > moneyLeft) break;

    const action: BuildStructureAction = {
      action: 'build',
      structure,
      coordinates: tile,
      faction: 'attacker',
      round,
    };
    actions.push(action);
    moneyLeft -= price;
    tiles.splice(tiles.indexOf(tile), 1);
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
  const minStructureCost = getMinStructureCost(matchConfig, faction);
  if (faction === 'defender') {
    //TODO: upgrade only towers with reach to opponents, then utilize reach in path coverage calculations
    const [upgrades, upgradesCost] = upgradeStructures(matchConfig, actors, faction, round, gold);
    // console.log({ upgrades, upgradeCost: upgradesCost });

    const { defenderBase, map, width, height } = matchState;
    const occupiedTiles = new Set(actors.map(actor => actor.coordinates));
    const nearbyTiles = getSurroundingCells(
      defenderBase.coordinates,
      width,
      height,
      BASE_TILES_RANGE
    ).filter(cell => map[cell].type === 'open' && !occupiedTiles.has(cell));
    const preferredTiles = computePathCoverage({ map, width, height }, nearbyTiles, TOWER_RANGE);
    const [baseTowers, baseTowersCost] = placeDefenderStructures(
      matchConfig,
      preferredTiles,
      round,
      gold - upgradesCost
    );
    // console.log({ baseTowers, baseTowersCost });

    const moneyLeft = gold - upgradesCost - baseTowersCost;
    //ran out of base tiles or none were available in the first place
    if (moneyLeft > minStructureCost) {
      const allTiles = getAvailableTiles(matchState.map, actors, faction);
      const otherTiles = computePathCoverage({ map, width, height }, allTiles, TOWER_RANGE);
      const [otherTowers] = placeDefenderStructures(matchConfig, otherTiles, round, moneyLeft);
      // console.log({ otherTowers });
      return [...upgrades, ...baseTowers, ...otherTowers];
    }

    return [...upgrades, ...baseTowers];
  }
  if (faction === 'attacker') {
    const [upgrades, upgradesCost] = upgradeStructures(matchConfig, actors, faction, round, gold);

    const startTiles = computeStartTiles(matchState);
    const routes = startTiles
      .map(tile => {
        const path = calculatePath(tile, matchState.defenderBase.coordinates, matchState.pathMap);
        const enemyTerritoryLength = path.filter(
          tile => matchState.map[tile].faction === 'defender'
        ).length;
        return { path, length: enemyTerritoryLength };
      })
      .sort((a, b) => a.length - b.length);

    const chosenPath = routes.shift()?.path;
    if (!chosenPath) return [];
    //calculate paths from blocked tile neighbours or to defender base
    const tilesOnPath = getAvailableTiles(matchState.map, actors, faction).filter(tile => {
      const spawn = findCloseBySpawnTile(matchState, tile);
      return chosenPath.includes(spawn);
    });
    //.orderBy((a,b) => euclideanDistance(defenderBase,b) - euclideanDistance(defenderBase,a)))

    const [baseCrypts, baseCryptsCost] = placeAttackerStructures(
      matchConfig,
      tilesOnPath,
      round,
      gold - upgradesCost
    );
    // console.log({ baseCrypts, baseCryptsCost });

    const moneyLeft = gold - upgradesCost - baseCryptsCost;
    //ran out of preffered tiles (all occupied already), place randomly
    if (moneyLeft > minStructureCost) {
      const allTiles = getAvailableTiles(matchState.map, actors, faction);
      const [otherCrypts] = placeAttackerStructures(matchConfig, allTiles, round, moneyLeft);
      // console.log({ otherTowers: otherCrypts });
      return [...upgrades, ...baseCrypts, ...otherCrypts];
    }
    return [...upgrades, ...baseCrypts];
  }
  console.error('Invalid faction');
  return [];
}

/**
 * @returns a list of possible starting points for attacker units (paths next to a blocked tile or attacker bases if no blocked tiles exist)
 */
export const computeStartTiles = (mapState: MapState) => {
  const basesStarts = mapState.map.reduce((bases, tile, index) => {
    if (tile.type === 'base' && tile.faction === 'attacker') {
      const surrounding = getSurroundingCells(index, mapState.width, mapState.height, 1).filter(
        tile => mapState.map[tile].type === 'path'
      );
      return [...bases, ...surrounding];
    }
    return bases;
  }, [] as number[]);

  const blockedStarts = mapState.map.reduce((tiles, item, index) => {
    if (item.type === 'blockedPath' && item.faction === 'attacker') {
      const surrounding = getSurroundingCells(index, mapState.width, mapState.height, 1);
      const paths = surrounding.filter(tile => mapState.map[tile].type === 'path');
      return [...tiles, ...paths];
    }
    return tiles;
  }, [] as number[]);

  return blockedStarts.length === 0 ? basesStarts : blockedStarts;
};
