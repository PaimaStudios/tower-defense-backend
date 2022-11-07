import { annotateMap, setPath } from "./map-processor.js"
import type { MatchState, ActorsObject, Coordinates, TurnAction, MatchConfig, Tile, PathTile } from "./types";
import Prando from "paima-engine/paima-prando";

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
const defaultUnits: ActorsObject = {
  towers: {},
  crypts: {},
  units: {}
}

const ms: MatchState = {
  width: mapWidth,
  height: mapHeight,
  defender: "0x0",
  attacker: "0x1",
  defenderGold: 100,
  attackerGold: 100,
  defenderBase: { health: 100, level: 1 },
  attackerBase: { level: 1 },
  actors: defaultUnits,
  contents: withPath,
  name: "jungle",
  currentRound: 1
}
function randomFromArray<T>(array: T[]): T {
  const index = Math.floor(Math.random() * array.length);
  return array[index];
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


import util from "util";
import processTick from "./index.js";
import { getRoundExecutor } from "./middleware.js";
// console.log(ms, "ms")

function toEmoji(m: MatchState, t: Tile): string {
  if (t.type === "attacker-structure") {
    // const unit = m.actors.crypts[t.id];
    return `🕌-${t.id}`
  }
  else if (t.type === "attacker-base") return "🕋"
  else if (t.type === "path") {
    const units = t.units;
    if (t.units.length === 0) return "="
    else return t.units.reduce((acc: string, item: number) => {
      const unit = m.actors.units[item];
      if (!unit) return acc
      else if (unit.subType === "gorilla") {
        if (acc === "")
          return acc + `${unit.health}🦍${item}`
        else return acc + "🦍"
      }
      else if (unit.subType === "jaguar") {
        if (acc === "")
          return acc + `${unit.health}🐆${item}`
        else return acc + "🐆"
      }
      else if (unit.subType === "macaw") {
        if (acc === "")
          return acc + `${unit.health}🦆${item}`
        else return acc + "🦆"
      }
      else return acc
    }, "")
  }
  else if (t.type === "defender-structure") {
    const unit = m.actors.towers[t.id];
    return `${unit.health}-🏛-${t.id}`
  }
  else if (t.type === "defender-base") return "🏰"
  else if (t.type === "attacker-open") return "🌳"
  else if (t.type === "defender-open") return "🌵"
  else if (t.type === "immovable-object") return "🌚"
  else return ""
}
function ppmap(m: MatchState) {
  const c = m.contents;
  return c.map(row => {
    return row.map(tile => toEmoji(m, tile))
  });
}
// console.log(util.inspect(ppmap(ms.contents), { showHidden: false, depth: null, colors: true }))

function testRun() {
  const rng = new Prando("oh hi");
  const moves = build(20, 10);
  for (let [tick, _] of Array(1500).entries()) {
    const events = processTick(matchConfig, ms, moves, tick + 1, rng);
    if (!events || ms.defenderBase.health < 1) {
      // console.log("round over")
    }
    else {
      console.log(tick, "current tick")
      console.table(ppmap(ms))
      console.log(ms.defenderBase)
    }
  }
  // console.log(util.inspect(matchState, { showHidden: false, depth: null, colors: true }))
}
// testRun()
async function testExec(){
  const res = await getRoundExecutor()
  const exec = res.result;
  console.log(exec.tick())
  console.log(exec.tick())
}
testExec()