import type {
  AttackerStructure,
  Coordinates,
  DefenderStructure,
  MatchConfig,
  StructureUpgradeTier,
  Tile,
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
  const path = pathFinder.findPath(startCoords, destinationCoords);
  return path.map(tuple => coordsToIndex({ x: tuple[0], y: tuple[1] }, width));
}

/**
 * Units always spawn on the attacker side of the map.
 */
export const isSpawnable = (tile: Tile) => tile.type === 'path' && tile.faction === 'attacker';
