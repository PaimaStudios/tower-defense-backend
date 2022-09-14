import type { AnnotatedMap, MatchState, PathTile, RawMap, Tile } from "./types";

export default function (m: RawMap): AnnotatedMap {
  return {
    name: m.name,
    width: m.width,
    height: m.height,
    contents: annotateMap(m.contents, m.height)
  }
}

// export function annotateMap(contents: number[], width: number): AccBunt {
//   const tiles = contents.map(c => findTile(c));
//   const accBunt: AccBunt = {bases: {
//     defenderBase: {type: "defender-base", coordinates: {x: 0, y: 0}, health: 100, level: 1},
//     attackerBase: {type: "attacker-base", level: 1},
//     towers: {},
//     crypts: {},
//     attackers: {}
//   }, map: []};
//   const reduced =  tiles.reduce((acc, tile, index) => {
//     const row = Math.floor(index / width);
//     const existing = acc.map[row] || []
//     acc.map[row] = [...existing, tile]
//     // set the coordinates if we find the base
//     if (tile.type === "defender-base")
//     acc.bases.defenderBase.coordinates = {x: row, y: acc.map[row].indexOf(tile)};
//     return acc
//   }, accBunt)
//   return reduced
// }

export function annotateMap(contents: number[], width: number): Tile[][] {
  const tiles = contents.map(c => findTile(c));
  const accBunt: Tile[][] = [];
  const reduced =  tiles.reduce((acc, tile, index) => {
    const row = Math.floor(index / width);
    const existing = acc[row] || []
    acc[row] = [...existing, tile]
    return acc
  }, accBunt)
  return reduced
}
function isPath(tile: Tile){
  return tile?.type === "path"
}
// mutating logic
export function setPath(map: Tile[][]): Tile[][]{
  for (let [rowidx, row] of map.entries()){
    // console.log(row, "Row")
    for (let [tileidx, tile] of row.entries()){
      // console.log(tile, "tile")
      if (isPath(tile)){
        const t = tile as PathTile
        const left = row?.[tileidx - 1];
        const right = row?.[tileidx + 1];
        // check horizontal neighbors
        if (isPath(left)) t["leads-to"] = [...t["leads-to"], {x: tileidx -1, y: rowidx}];
        // path right is going backwards!
        // if (isPath(right)) t["leads-to"] = [...t["leads-to"], {x: tileidx +1, y: rowidx}];
        // check vertical neighbors
        const up = map[rowidx - 1]?.[tileidx];
        const down = map[rowidx + 1]?.[tileidx];
        if (isPath(up)) t["leads-to"] = [...t["leads-to"], {x: tileidx, y: rowidx -1}];
        if (isPath(down)) t["leads-to"] = [...t["leads-to"], {x: tileidx, y: rowidx + 1}];
      }
    }
  }
  return map
}

function findTile(c: number): Tile {
  if (c === 0) return {
    type: "immovable-object"
  }
  else if (c === 1) return {
    "type": "defender-open"
  }
  else if (c === 2) return {
    "type": "attacker-open"
  }
  else if (c === 3) return {
    "type": "defender-base",
    // id: 1 by default
  }
  else if (c === 4) return {
    "type": "attacker-base",
    // id: 2 by default
  }
  else if (c === 5) return {
    "type": "path",
    "faction": "defender",
    "leads-to": [],
    unit: null
  }
  else if (c === 6) return {
    "type": "path",
    "faction": "attacker",
    "leads-to": [],
    unit: null
  }
  else return {
    type: "immovable-object"
  }
}