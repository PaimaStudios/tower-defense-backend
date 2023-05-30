import type {
  AttackerStructure,
  BuildStructureAction,
  Coordinates,
  DefenderStructure,
  MatchConfig,
  StructureUpgradeTier,
  Tile,
  TurnAction,
} from '@tower-defense/utils';
import { AStarFinder } from 'astar-typescript';

export const calculateRecoupGold = (
  { structure, upgrades }: AttackerStructure | DefenderStructure,
  config: MatchConfig
): number => {
  const structureConfigGraph = config[structure];

  let price = 0;
  for (let tier = 1; tier <= upgrades; tier++) {
    price += structureConfigGraph[tier as StructureUpgradeTier].price;
  }
  return Math.floor((config.recoupPercentage / 100) * price);
};

/**
 * Converts coord notation ({x: number, y: number}) to a single number, index of the flat map array.
 */
export function coordsToIndex(coords: Coordinates, width: number): number {
  return width * coords.y + coords.x;
}

/**
 * Converts an index of the flat map to coord notation
 */
export function indexToCoords(i: number, width: number): Coordinates {
  const y = Math.floor(i / width);
  const x = i - y * width;
  return { x, y };
}

/**
 * Validate that coords don't overflow the map.
 */
export function validateCoords(
  coords: Coordinates,
  mapWidth: number,
  mapHeight: number
): number | null {
  if (coords.x < 0 || coords.x >= mapWidth) return null;
  if (coords.y < 0 || coords.y >= mapHeight) return null;
  else return coordsToIndex(coords, mapWidth);
}

export function calculatePath(start: number, destination: number, map: Array<0 | 1>[]): number[] {
  const width = map[0].length;
  const startCoords = indexToCoords(start, width);
  const destinationCoords = indexToCoords(destination, width);
  const pathFinder = new AStarFinder({
    grid: {
      matrix: map,
    },
    diagonalAllowed: false,
  });

  if (!isWalkable(map[startCoords.y][startCoords.x])) {
    const adjacentTiles = adjacentWalkableTiles(startCoords, map);
    if (adjacentTiles.length === 0) {
      console.error('Broken map, no path next to a blocked spawn tile.');
      return [];
    }
    const tile = chooseTile(adjacentTiles, width);
    const path = pathFinder
      .findPath(indexToCoords(tile, width), destinationCoords)
      .map(tuple => coordsToIndex({ x: tuple[0], y: tuple[1] }, width));
    return [start, ...path];
  }

  const path = pathFinder.findPath(startCoords, destinationCoords);
  return path.map(tuple => coordsToIndex({ x: tuple[0], y: tuple[1] }, width));
}

/**
 * Units always spawn on the attacker side of the map. And while walking through a blocked tile is not possible, units can spawn on one.
 */
export const isSpawnable = (tile: Tile) =>
  (tile.type === 'path' || tile.type === 'blockedPath') && tile.faction === 'attacker';

const isWalkable = (tile: 0 | 1) => tile === 0;

function adjacentWalkableTiles(point: Coordinates, map: Array<0 | 1>[]): number[] {
  const width = map[0].length;
  const height = map.length;
  const { x, y } = point;
  return [
    { x, y: y - 1 },
    { x: x + 1, y },
    { x, y: y + 1 },
    { x: x - 1, y },
  ]
    .map(coordinates => validateCoords(coordinates, width, height))
    .filter((index): index is number => {
      if (index == null) return false;
      const coordinates = indexToCoords(index, width);
      return isWalkable(map[coordinates.y][coordinates.x]);
    });
}

export function chooseTile(tiles: number[], mapWidth: number): number {
  const pick = tiles.reduce((prev, curr) => {
    const a = indexToCoords(prev, mapWidth);
    const b = indexToCoords(curr, mapWidth);
    // whoever is further to the left
    if (a.x < b.x) return prev;
    else if (b.x < a.x) return curr;
    // else whoever is more centered in the y axis
    else return Math.abs(6 - a.y) < Math.abs(6 - b.y) ? prev : curr;
  });
  return pick;
}

export function isBuildAction(action: TurnAction): action is BuildStructureAction {
  return action.action === 'build';
}

export function isDefenderStructure(
  structure: AttackerStructure | DefenderStructure
): structure is DefenderStructure {
  return structure.faction === 'defender';
}

export const euclideanDistance = (a: Coordinates, b: Coordinates): number => {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
};
