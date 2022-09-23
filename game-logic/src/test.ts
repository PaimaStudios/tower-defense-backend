import { annotateMap, setPath } from "./map-processor.js"
import type { StatefulUnitGraph, MatchState, UnitsObject, Coordinates, TurnAction, MatchConfig, Tile, PathTile } from "./types";
import Prando from "prando";

const testmap = [
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
const matchConfig: MatchConfig = { something: "something" };
const mapHeight = 13;
const mapWidth = 22;
const am = annotateMap(testmap, mapWidth);
const withPath = setPath(am);
const defaultUnits: UnitsObject = {
  defenderBase: { type: "defender-base", health: 100, level: 1 },
  attackerBase: { type: "attacker-base", level: 1 },
  towers: {},
  crypts: {},
  attackers: {}
}

const ms: MatchState = {
  width: mapWidth,
  height: mapHeight,
  defender: "0x0",
  attacker: "0x1",
  defenderGold: 100,
  attackerGold: 100,
  units: defaultUnits,
  contents: withPath,
  name: "jungle",
  currentRound: 1
}
function randomFromArray<T>(array: T[]): T {
  const index = Math.floor(Math.random() * array.length);
  return array[index];
}

function build(): TurnAction[] {
  const available = availableForBuilding(testmap);
  const towers: TurnAction[] = available.towers.sort(() => 0.5 - Math.random()).slice(0, 20).map(coords => {
    return {
      action: "build",
      x: coords.x,
      y: coords.y,
      structure: randomFromArray(["piranha-tower", "anaconda-tower", "sloth-tower"])
    }
  })
  const crypts: TurnAction[] = available.crypts.sort(() => 0.5 - Math.random()).slice(0, 10).map(coords => {
    return {
      action: "build",
      x: coords.x,
      y: coords.y,
      structure: randomFromArray(["macaw-crypt", "gorilla-crypt", "jaguar-crypt"])
    }
  })
  return [...towers, ...crypts]
}


import util from "util";
import moveToTickEvent from "./index.js";
// console.log(ms, "ms")

function toEmoji(t: Tile, unitType = "", unitID = 0, unitHealth="", double = false): string {
  if (t.type === "attacker-structure") return `🕌${unitID}`
  else if (t.type === "attacker-base") return "🕋"
  else if (t.type === "path" && double) return `🙉`
  else if (t.type === "path" && unitType === "gorilla") return `${unitHealth}🦍${unitID}`
  else if (t.type === "path" && unitType === "jaguar") return `${unitHealth}🐆${unitID}`
  else if (t.type === "path" && unitType === "macaw") return `${unitHealth}🦆${unitID}`
  else if (t.type === "path") return "="
  else if (t.type === "defender-structure") return `${unitHealth}🏛${unitID}`
  else if (t.type === "defender-base") return "🏰"
  else if (t.type === "attacker-open") return "🌳"
  else if (t.type === "defender-open") return "🌵"
  else if (t.type === "immovable-object") return "🌚"
  else return ""
}
function ppmap(m: MatchState) {
  const c = m.contents;
  return c.map(row => {
    return row.map(tile => {
      if (tile.type === "path" && tile.units.length > 0) {
        try {
          if (tile.units.length > 1) {
            const unit = m.units.attackers[tile.units[0]]
            return toEmoji(tile, unit.subType, unit.id, `${unit.health}`, true)
          }
          else {
            const unit = m.units.attackers[tile.units[0]]
          return toEmoji(tile, unit.subType, unit.id, `${unit.health}`)
          }
        } catch (e) {
          console.log(tile)
          // console.log(m.units.attackers)
        }
      }
      else if (tile.type === "defender-structure"){ 
        const tower = m.units.towers[tile.id]
        return toEmoji(tile, "", tile.id, `${tower.health}`)
      }
      else if (tile.type === "attacker-structure")  return toEmoji(tile, "", tile.id)
      else return toEmoji(tile)
    })
  })
}
// console.log(util.inspect(ppmap(ms.contents), { showHidden: false, depth: null, colors: true }))

function testRun() {
  const rng = new Prando("oh hi");
  const moves = build();
  const matchState = ms;
  for (let [tick, _] of Array(200).entries()) {
    const events = moveToTickEvent(matchConfig, matchState, moves, tick + 1, rng);
    if (!events || matchState.units.defenderBase.health < 1) {
      // console.log("round over")
    }
    else {
      console.log(tick, "current tick")
      console.table(ppmap(matchState))
      console.log(matchState.units.defenderBase)
    }
  }
  // console.log(util.inspect(matchState, { showHidden: false, depth: null, colors: true }))
}
testRun()