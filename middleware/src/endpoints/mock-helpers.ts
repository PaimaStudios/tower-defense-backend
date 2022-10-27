import type { Tile, PathTile, Coordinates, TurnAction } from "td-utils";

export const testmap = [
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2,
  1, 5, 5, 5, 1, 5, 5, 5, 1, 5, 5, 5, 1, 2, 6, 6, 6, 2, 6, 6, 6, 2,
  1, 5, 1, 5, 1, 5, 1, 5, 1, 5, 1, 5, 1, 2, 6, 2, 6, 2, 6, 2, 6, 2,
  1, 5, 1, 5, 5, 5, 1, 5, 5, 5, 1, 5, 5, 6, 6, 2, 6, 6, 6, 2, 6, 2,
  1, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 6, 2,
  1, 5, 1, 1, 1, 1, 1, 5, 5, 5, 1, 1, 1, 2, 6, 6, 6, 2, 2, 2, 6, 2,
  3, 5, 5, 5, 5, 1, 1, 5, 1, 5, 5, 5, 1, 2, 6, 2, 6, 2, 6, 6, 6, 4,
  1, 5, 1, 1, 5, 1, 5, 5, 1, 1, 1, 5, 1, 2, 6, 2, 6, 6, 6, 2, 6, 2,
  1, 5, 1, 1, 5, 5, 5, 1, 1, 1, 1, 5, 5, 6, 6, 2, 2, 2, 2, 2, 6, 2,
  1, 5, 1, 1, 1, 1, 1, 1, 5, 5, 5, 1, 1, 2, 2, 2, 6, 6, 6, 2, 6, 2,
  1, 5, 1, 5, 5, 5, 5, 1, 5, 1, 5, 1, 1, 2, 6, 6, 6, 2, 6, 2, 6, 2,
  1, 5, 5, 5, 1, 1, 5, 5, 5, 1, 5, 5, 5, 6, 6, 2, 2, 2, 6, 6, 6, 2,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2,
]
export function annotateMap(contents: number[], width: number): Tile[][] {
  const tiles = contents.map(c => findTile(c));
  const accBunt: Tile[][] = [];
  const reduced = tiles.reduce((acc, tile, index) => {
    const row = Math.floor(index / width);
    const existing = acc[row] || []
    acc[row] = [...existing, tile]
    return acc
  }, accBunt)
  return reduced
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
    units: []
  }
  else if (c === 6) return {
    "type": "path",
    "faction": "attacker",
    "leads-to": [],
    units: []
  }
  else return {
    type: "immovable-object"
  }
}
export function setPath(map: Tile[][]): Tile[][] {
  for (let [rowidx, row] of map.entries()) {
    // console.log(row, "Row")
    for (let [tileidx, tile] of row.entries()) {
      // console.log(tile, "tile")
      if (isPath(tile)) {
        const t = tile as PathTile
        const left = row?.[tileidx - 1];
        const right = row?.[tileidx + 1];
        const up = map[rowidx - 1]?.[tileidx];
        const down = map[rowidx + 1]?.[tileidx];
        // set one single possible path if the defender base is nearby, as we want to go there and nowhere else
        if (isBase(left)) t["leads-to"] = [...t["leads-to"], { x: tileidx - 1, y: rowidx }];
        else if (isBase(right)) t["leads-to"] = [...t["leads-to"], { x: tileidx + 1, y: rowidx }];
        else if (isBase(up)) t["leads-to"] = [...t["leads-to"], { x: tileidx, y: rowidx - 1 }];
        else if (isBase(down)) t["leads-to"] = [...t["leads-to"], { x: tileidx, y: rowidx + 1 }];
        // set all possible paths if the defender base is not around
        else {
          // check where the base is so units don't backtrack
          if (isPath(left)) t["leads-to"] = [...t["leads-to"], { x: tileidx - 1, y: rowidx }];
          if (isPath(right)) t["leads-to"] = [...t["leads-to"], { x: tileidx + 1, y: rowidx }];
          if (isPath(up)) t["leads-to"] = [...t["leads-to"], { x: tileidx, y: rowidx - 1 }];
          if (isPath(down)) t["leads-to"] = [...t["leads-to"], { x: tileidx, y: rowidx + 1 }];
        }
      }
    }
  }
  return map
}
function isPath(tile: Tile) {
  return tile?.type === "path"
}
function isBase(tile: Tile) {
  return tile?.type === "defender-base"
}
export function build(towerCount: number, cryptCount: number): TurnAction[] {
  const available = availableForBuilding(testmap);
  const towers: TurnAction[] = available.towers.sort(() => 0.5 - Math.random()).slice(0, towerCount).map(coords => {
    return {
      action: "build",
      x: coords.x,
      y: coords.y,
      structure: randomFromArray(["piranha-tower", "anaconda-tower", "sloth-tower"])
    }
  })
  const crypts: TurnAction[] = available.crypts.sort(() => 0.5 - Math.random()).slice(0, cryptCount).map(coords => {
    return {
      action: "build",
      x: coords.x,
      y: coords.y,
      structure: randomFromArray(["macaw-crypt", "gorilla-crypt", "jaguar-crypt"])
    }
  })
  return [...towers, ...crypts]
}
function randomFromArray<T>(array: T[]): T {
  const index = Math.floor(Math.random() * array.length);
  return array[index];
}
function availableForBuilding(map: number[]): { towers: Coordinates[], crypts: Coordinates[] } {
  let towers = [];
  let crypts = [];
  for (let [i, cell] of map.entries()) {
    const row = Math.floor(i / 22);
    const col = i - (row * 22)
    if (cell === 1)
      towers.push({ x: col, y: row })
    else if (cell === 2)
      crypts.push({ x: col, y: row })
  }
  return { towers, crypts }
}