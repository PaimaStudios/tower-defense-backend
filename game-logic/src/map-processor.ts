import type Prando from 'paima-engine/paima-prando';
import type { WalletAddress } from 'paima-engine/paima-utils';
import type {
  AnnotatedMap,
  MatchState,
  RawMap,
  Tile,
  TileNumber,
  RoleSetting,
  MatchConfig,
} from '@tower-defense/utils';

export function generateMatchState(
  creatorFaction: RoleSetting,
  lobbyCreator: WalletAddress,
  playerTwo: WalletAddress,
  mapName: string,
  mapLayout: string,
  matchConfig: MatchConfig,
  randomnessGenerator: Prando
): MatchState {
  const [attacker, defender] =
    creatorFaction === 'attacker'
      ? [lobbyCreator, playerTwo]
      : creatorFaction === 'defender'
      ? [playerTwo, lobbyCreator]
      : randomizeRoles(lobbyCreator, playerTwo, randomnessGenerator);
  // TODO are all maps going to be the same width?
  const rawMap = processMapLayout(mapName, mapLayout);
  const annotatedMap = getMap(rawMap);
  const baseIndex = annotatedMap.map.findIndex(t => t.type === 'base' && t.faction === 'defender');
  return {
    ...annotatedMap,
    attacker,
    defender,
    attackerGold: matchConfig.baseAttackerGoldRate,
    defenderGold: matchConfig.baseDefenderGoldRate,
    attackerBase: { level: 1 },
    defenderBase: { level: 1, health: matchConfig.defenderBaseHealth, coordinates: baseIndex },
    actorCount: 2,
    actors: { crypts: {}, towers: {}, units: {} },
    currentRound: 1,
    finishedSpawning: [],
    roundEnded: false,
  };
}
function randomizeRoles(
  creator: WalletAddress,
  joiner: WalletAddress,
  randomnessGenerator: Prando
): [WalletAddress, WalletAddress] {
  const number = randomnessGenerator.next();
  if (number < 0.5) return [creator, joiner];
  else return [joiner, creator];
}
// Layouts as given by catastrophe are a long string, with rows of numbers
// separated by \r\n .
function processMapLayout(mapName: string, mapString: string): RawMap {
  const rows = mapString.split('\\r\\n');
  return {
    name: mapName,
    width: rows[0].length,
    height: rows.length,
    contents: rows
      .reverse()
      .join('')
      .split('')
      .map(s => parseInt(s) as TileNumber),
  };
}
export function getMap(m: RawMap): AnnotatedMap {
  return {
    name: m.name,
    width: m.width,
    height: m.height,
    map: fillMap(m.contents),
    pathMap: mapToMatrix(m.contents, m.width),
  };
}
function mapToMatrix(map: TileNumber[], width: number): Array<0 | 1>[] {
  const matrix = [];
  const walkableTiles: TileNumber[] = [3, 5, 6];
  for (let i = 0; i < map.length; i += width) {
    const row = map.slice(i, i + width).map(tile => (walkableTiles.includes(tile) ? 0 : 1));
    matrix.push(row);
  }
  return matrix;
}

export function fillMap(contents: TileNumber[]): Tile[] {
  return contents.map(tile => tileMap[tile]);
}

export function annotateMap(contents: TileNumber[], width: number): Tile[][] {
  const tiles = contents.map(tile => tileMap[tile]);
  const reduced = tiles.reduce((acc, tile, index) => {
    const row = Math.floor(index / width);
    const existing = acc[row] || [];
    acc[row] = [...existing, tile];
    return acc;
  }, [] as Tile[][]);
  return reduced;
}

const tileMap: Record<TileNumber, Tile> = {
  1: { type: 'open', faction: 'defender' },
  2: { type: 'open', faction: 'attacker' },
  3: { type: 'base', faction: 'defender' },
  4: { type: 'base', faction: 'attacker' },
  5: { type: 'path', faction: 'defender' },
  6: { type: 'path', faction: 'attacker' },
  7: { type: 'unbuildable', faction: 'defender' },
  8: { type: 'unbuildable', faction: 'attacker' },
  9: { type: 'blockedPath', faction: 'attacker' },
  0: { type: 'blockedPath', faction: 'defender' },
  // ...
};
