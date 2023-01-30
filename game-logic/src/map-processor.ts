import type {
  AnnotatedMap,
  MatchState,
  PathTile,
  RawMap,
  Tile,
  TileNumber,
} from '@tower-defense/utils';

export function getMap(m: RawMap): AnnotatedMap {
  return {
    name: m.name,
    width: m.width,
    height: m.height,
    mapState: annotateMap(m.contents, m.height).flat(),
  };
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
// mutating logic
export function setPath(map: Tile[][]): Tile[][] {
  for (const [rowidx, row] of map.entries()) {
    // console.log(row, "Row")
    for (const [tileidx, tile] of row.entries()) {
      // console.log(tile, "tile")
      if (isPath(tile)) {
        const t = tile as PathTile;
        const left = row?.[tileidx - 1];
        const right = row?.[tileidx + 1];
        const up = map[rowidx - 1]?.[tileidx];
        const down = map[rowidx + 1]?.[tileidx];
        // set one single possible path if the defender base is nearby, as we want to go there and nowhere else
        if (isBase(left)) t['leadsTo'] = [...t['leadsTo'], { x: tileidx - 1, y: rowidx }];
        else if (isBase(right)) t['leadsTo'] = [...t['leadsTo'], { x: tileidx + 1, y: rowidx }];
        else if (isBase(up)) t['leadsTo'] = [...t['leadsTo'], { x: tileidx, y: rowidx - 1 }];
        else if (isBase(down)) t['leadsTo'] = [...t['leadsTo'], { x: tileidx, y: rowidx + 1 }];
        // set all possible paths if the defender base is not around
        else {
          // check where the base is so units don't backtrack
          if (isPath(left)) t['leadsTo'] = [...t['leadsTo'], { x: tileidx - 1, y: rowidx }];
          if (isPath(right)) t['leadsTo'] = [...t['leadsTo'], { x: tileidx + 1, y: rowidx }];
          if (isPath(up)) t['leadsTo'] = [...t['leadsTo'], { x: tileidx, y: rowidx - 1 }];
          if (isPath(down)) t['leadsTo'] = [...t['leadsTo'], { x: tileidx, y: rowidx + 1 }];
        }
      }
    }
  }
  return map;
}
const tileMap: Record<TileNumber, Tile> = {
  1: { type: 'open', faction: 'defender' },
  2: { type: 'open', faction: 'attacker' },
  3: { type: 'base', faction: 'defender' },
  4: { type: 'base', faction: 'attacker' },
  5: { type: 'path', faction: 'defender', leadsTo: [], units: [] },
  6: { type: 'path', faction: 'attacker', leadsTo: [], units: [] },
  7: { type: 'unbuildable', faction: 'defender' },
  8: { type: 'unbuildable', faction: 'attacker' },
  // ...
};
function findTile(c: TileNumber): Tile {
  return tileMap[c];
}