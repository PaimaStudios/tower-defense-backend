import type { AnnotatedMap, RawMap, Tile, TileNumber } from '@tower-defense/utils';

export function getMap(m: RawMap): AnnotatedMap {
  return {
    name: m.name,
    width: m.width,
    height: m.height,
    mapState: fillMap(m.contents, m.width),
  };
}

export function fillMap(contents: TileNumber[], mapWidth: number): Tile[] {
  return contents.map((n, i) => {
    const tile = findTile(n);
    if (tile.type === 'path') return { ...tile, leadsTo: fillPath(i, contents, mapWidth) };
    else return tile;
  });
}
function fillPath(index: number, rawMap: TileNumber[], mapWidth: number): number[] {
  const leftIndex = index - 1;
  const rightIndex = index + 1;
  const upIndex = index - mapWidth;
  const downIndex = index + mapWidth;
  const left = rawMap[leftIndex];
  const right = rawMap[rightIndex];
  const up = rawMap[upIndex];
  const down = rawMap[downIndex];
  // is defender base is nearby, make that the single path destination
  if (left === 3) return [leftIndex];
  if (right === 3) return [rightIndex];
  if (up === 3) return [upIndex];
  if (down === 3) return [downIndex];
  const paths: number[] = [];
  // Else find all paths available
  if (left === 5 || left === 6) paths.push(leftIndex);
  if (right === 5 || right === 6) paths.push(rightIndex);
  if (up === 5 || up === 6) paths.push(upIndex);
  if (down === 5 || down === 6) paths.push(downIndex);
  return paths;
}

export function annotateMap(contents: TileNumber[], width: number): Tile[][] {
  const tiles = contents.map(c => findTile(c));
  const accBunt: Tile[][] = [];
  const reduced = tiles.reduce((acc, tile, index) => {
    const row = Math.floor(index / width);
    const existing = acc[row] || [];
    acc[row] = [...existing, tile];
    return acc;
  }, accBunt);
  return reduced;
}
function isPath(tile: Tile) {
  return tile?.type === 'path';
}
function isBase(tile: Tile) {
  return tile?.type === 'base' && tile?.faction === 'defender';
}

const tileMap: Record<TileNumber, Tile> = {
  1: { type: 'open', faction: 'defender' },
  2: { type: 'open', faction: 'attacker' },
  3: { type: 'base', faction: 'defender' },
  4: { type: 'base', faction: 'attacker' },
  5: { type: 'path', faction: 'defender', leadsTo: [] },
  6: { type: 'path', faction: 'attacker', leadsTo: [] },
  7: { type: 'unbuildable', faction: 'defender' },
  8: { type: 'unbuildable', faction: 'attacker' },
  // ...
};
function findTile(c: TileNumber): Tile {
  return tileMap[c];
}
