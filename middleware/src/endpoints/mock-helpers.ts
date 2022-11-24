import type { Tile, PathTile, Coordinates, TurnAction, MatchConfig } from "@tower-defense/utils";
import {consumer} from "paima-engine/paima-concise"

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
    const existing = acc[row] || [];
    const t = {...tile, x: row + 1};
    acc[row] = [...existing, t];
    const y = acc[row].indexOf(t);
    acc[row][y] = {...t, y: y+ 1}
    return acc
  }, accBunt)
  return reduced
}
function findTile(c: number): Tile {
  if (c === 0) return {
    type: "immovableObject"
  }
  else if (c === 1) return {
    "type": "open", faction: "defender"
  }
  else if (c === 2) return {
    "type": "open", faction: "attacker"
  }
  else if (c === 3) return {
    "type": "base", faction: "defender"
    // id: 1 by default
  }
  else if (c === 4) return {
    "type": "base", faction: "attacker"
    // id: 2 by default
  }
  else if (c === 5) return {
    "type": "path",
    "faction": "defender",
    "leadsTo": [],
    units: []
  }
  else if (c === 6) return {
    "type": "path",
    "faction": "attacker",
    "leadsTo": [],
    units: []
  }
  else return {
    type: "immovableObject"
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
        if (isBase(left)) t["leadsTo"] = [...t["leadsTo"], { x: tileidx - 1, y: rowidx }];
        else if (isBase(right)) t["leadsTo"] = [...t["leadsTo"], { x: tileidx + 1, y: rowidx }];
        else if (isBase(up)) t["leadsTo"] = [...t["leadsTo"], { x: tileidx, y: rowidx - 1 }];
        else if (isBase(down)) t["leadsTo"] = [...t["leadsTo"], { x: tileidx, y: rowidx + 1 }];
        // set all possible paths if the defender base is not around
        else {
          // check where the base is so units don't backtrack
          if (isPath(left)) t["leadsTo"] = [...t["leadsTo"], { x: tileidx - 1, y: rowidx }];
          if (isPath(right)) t["leadsTo"] = [...t["leadsTo"], { x: tileidx + 1, y: rowidx }];
          if (isPath(up)) t["leadsTo"] = [...t["leadsTo"], { x: tileidx, y: rowidx - 1 }];
          if (isPath(down)) t["leadsTo"] = [...t["leadsTo"], { x: tileidx, y: rowidx + 1 }];
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
  return tile?.type === "base" && tile?.faction === "defender"
}

export function build(towerCount: number, cryptCount: number): TurnAction[] {
  const available = availableForBuilding(testmap);
  const towers: TurnAction[] = available.towers.sort(() => 0.5 - Math.random()).slice(0, towerCount).map(coords => {
    return {
      round: 1,
      action: "build",
      x: coords.x,
      y: coords.y,
      structure: randomFromArray(["piranhaTower", "anacondaTower", "slothTower"])
    }
  })
  const crypts: TurnAction[] = available.crypts.sort(() => 0.5 - Math.random()).slice(0, cryptCount).map(coords => {
    return {
      round: 1,
      action: "build",
      x: coords.x,
      y: coords.y,
      structure: randomFromArray(["macawCrypt", "gorillaCrypt", "jaguarCrypt"])
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
export function parseConfig(s: string): MatchConfig{

return {...baseConfig}
}

const baseTowerConfig = {
  health: 100,
  cooldown: 10,
  damage: 1,
  range: 1
}
const baseCryptConfig = {
  health: 100,
  capacity: 10,
  damage: 1,
  speed: 5
}
export const baseConfig = {
  baseAttackerGoldRate: 100,
  baseDefenderGoldRate: 100,
  baseSpeed: 20,
  anaconda: baseTowerConfig,
  piranha: baseTowerConfig,
  sloth: baseTowerConfig,
  macaw: baseCryptConfig,
  gorilla: baseCryptConfig,
  jaguar: baseCryptConfig,
}
