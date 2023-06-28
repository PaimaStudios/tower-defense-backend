import type {
  BotDifficulty,
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
import type Prando from 'paima-engine/paima-prando';

type PathCoverage = {
  index: number;
  coverage: number;
};

type CounterBuild = {
  structures: StructureType[];
  fallback?: StructureType;
};

type BotMovesFunction = (
  matchConfig: MatchConfig,
  matchState: MatchState,
  faction: Faction,
  round: number,
  prando: Prando
) => TurnAction[];

/**
 * @returns pseudo random list of structures to build
 */
export const generateRandomMoves: BotMovesFunction = (
  matchConfig,
  matchState,
  faction,
  round,
  prando
) => {
  const gold = faction === 'defender' ? matchState.defenderGold : matchState.attackerGold;
  const actors = Object.values(matchState.actors[faction === 'attacker' ? 'crypts' : 'towers']);
  const availableTiles = getAvailableTiles(matchState.map, actors, faction);
  const toBuild = chooseStructures(matchConfig, faction, round, gold, availableTiles, prando);
  return toBuild;
};

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

//TODO: check by someone more knowledgeable in config
const counterStructureMap: Record<StructureType, StructureType[]> = {
  piranhaTower: ['gorillaCrypt'],
  anacondaTower: ['macawCrypt'],
  slothTower: ['jaguarCrypt'],

  gorillaCrypt: ['anacondaTower'],
  macawCrypt: ['piranhaTower', 'slothTower'],
  jaguarCrypt: ['piranhaTower'],
};

/**
 * Computes list of suitable structures to build based on opponent structures
 * plus fallbackStructure: counter to most common opponent structure
 * WARN: tiers are ignored
 */
export const computeCounterBuild = (
  playerStructures: Structure[],
  opponentStructures: Structure[],
  prando: Prando
): CounterBuild => {
  const counters = opponentStructures.map(structure => {
    const structures = counterStructureMap[structure.structure];
    const randomIndex = prando.nextInt(0, structures.length - 1);
    return structures[randomIndex];
  });

  // remove already build structures from list of counter structures
  playerStructures.forEach(structure => {
    const covered = counters.find(counter => counter === structure.structure);
    if (covered) {
      counters.splice(counters.indexOf(covered), 1);
    }
  });

  //most common counter should be a fallback tower once everything else is countered already
  const sortedCounters = counters
    .reduce((acc, curr) => {
      const structure = acc.find(item => item.structure === curr);
      if (!structure) acc.push({ count: 1, structure: curr });
      else structure.count += 1;
      return acc;
    }, [] as { structure: StructureType; count: number }[])
    .sort((a, b) => b.count - a.count);
  return {
    structures: counters,
    fallback: sortedCounters[0]?.structure,
  };
};

/**
 * @returns list of structures to be randomply placed on provided tiles. stops once budget is depleted or no more tiles are available
 */
function chooseStructures(
  matchConfig: MatchConfig,
  faction: Faction,
  round: number,
  budget: number,
  availableTiles: number[],
  prando: Prando
): BuildStructureAction[] {
  const choices = getPossibleStructures(faction);

  let currentBudget = budget;
  const actions: BuildStructureAction[] = [];
  while (currentBudget > 0) {
    const structure = choices[prando.nextInt(0, choices.length - 1)];
    const price = matchConfig[structure][1].price;
    if (currentBudget < price || availableTiles.length === 0) break;

    const coordinates = availableTiles[prando.nextInt(0, availableTiles.length - 1)];
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
  counterBuild: CounterBuild,
  round: number,
  budget: number,
  prando: Prando
): [BuildStructureAction[], number] {
  const choices = getPossibleStructures('defender');
  let moneyLeft = budget;
  const actions: BuildStructureAction[] = [];
  while (moneyLeft > 0 && tiles.length > 0) {
    const tile = tiles.shift();
    const random = choices[prando.nextInt(0, choices.length - 1)];
    const structure = counterBuild.structures.shift() ?? counterBuild.fallback ?? random;
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
  counterBuild: CounterBuild,
  round: number,
  budget: number,
  prando: Prando
): [BuildStructureAction[], number] {
  const choices = getPossibleStructures('attacker');

  let moneyLeft = budget;
  const actions: BuildStructureAction[] = [];
  while (moneyLeft > 0 && tiles.length > 0) {
    const tile = tiles[prando.nextInt(0, tiles.length - 1)];
    const random = choices[prando.nextInt(0, choices.length - 1)];
    const structure = counterBuild.structures.shift() ?? counterBuild.fallback ?? random;
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
export const generateBotMoves: BotMovesFunction = (
  matchConfig,
  matchState,
  faction,
  round,
  prando
) => {
  const gold = matchState[`${faction}Gold`];
  const minStructureCost = getMinStructureCost(matchConfig, faction);
  const actors = Object.values(matchState.actors[faction === 'attacker' ? 'crypts' : 'towers']);
  const opponent = Object.values(matchState.actors[faction === 'attacker' ? 'towers' : 'crypts']);
  const counterBuild = computeCounterBuild(actors, opponent, prando);

  if (faction === 'defender') {
    //TODO: upgrade only towers with reach to opponents, then utilize reach in path coverage calculations
    const [upgrades, upgradesCost] = upgradeStructures(matchConfig, actors, faction, round, gold);

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
      counterBuild,
      round,
      gold - upgradesCost,
      prando
    );

    const moneyLeft = gold - upgradesCost - baseTowersCost;
    //ran out of base tiles or none were available in the first place
    if (moneyLeft > minStructureCost) {
      const allTiles = getAvailableTiles(matchState.map, actors, faction);
      const otherTiles = computePathCoverage({ map, width, height }, allTiles, TOWER_RANGE);
      const [otherTowers] = placeDefenderStructures(
        matchConfig,
        otherTiles,
        counterBuild,
        round,
        moneyLeft,
        prando
      );
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

    const [baseCrypts, baseCryptsCost] = placeAttackerStructures(
      matchConfig,
      tilesOnPath,
      counterBuild,
      round,
      gold - upgradesCost,
      prando
    );

    const moneyLeft = gold - upgradesCost - baseCryptsCost;
    //ran out of preffered tiles (all occupied already), place randomly
    if (moneyLeft > minStructureCost) {
      const allTiles = getAvailableTiles(matchState.map, actors, faction);
      const [otherCrypts] = placeAttackerStructures(
        matchConfig,
        allTiles,
        counterBuild,
        round,
        moneyLeft,
        prando
      );
      return [...upgrades, ...baseCrypts, ...otherCrypts];
    }
    return [...upgrades, ...baseCrypts];
  }
  console.error('Invalid faction');
  return [];
};

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

export const generateMoves: Record<BotDifficulty, BotMovesFunction> = {
  easy: generateRandomMoves,
  hard: generateBotMoves,
};
