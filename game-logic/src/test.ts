import { annotateMap, setPath } from "./map-processor"
import type { MatchState, ActorsObject, Coordinates, TurnAction, MatchConfig, Tile, PathTile } from "@tower-defense/utils";
import Prando from "paima-engine/paima-prando";
import { parseConfig } from "./config";
const lol = "lol";
import processTick from "./index"
import {
  RoundExecutor as RoundExecutorConstructor,
} from 'paima-engine/paima-executors';

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



// function ppmap(m: MatchState) {
//   const c = m.contents;
//   return c.map(row => {
//     return row.map(tile => toEmoji(m, tile))
//   });
// }
// // console.log(util.inspect(ppmap(ms.contents), { showHidden: false, depth: null, colors: true }))

function testRun(matchState: MatchState, moves: TurnAction[]) {
  const seed = "test";
  const rng = new Prando("oh hi");
  const configString = 'r|1|gr;d;105|st;h150;d5;r2'; // we would get this from the db in production
  const matchConfig: MatchConfig = parseConfig(configString);
  const executor = RoundExecutorConstructor.initialize(
    matchConfig,
    matchState,
    moves,
    rng,
    processTick
  );
  return executor 
}


function sum(a: number, b: number) {
  return a + b;
}
function getMatchState(){
  const am = annotateMap(testmap, 22);
  const withPath = setPath(am);
  return {
    width: 22,
    height: 13,
    defender: '0xdDA309096477b89D7066948b31aB05924981DF2B',
    attacker: '0xcede5F9E2F8eDa3B6520779427AF0d052B106B57',
    defenderGold: 100,
    attackerGold: 100,
    defenderBase: { health: 100, level: 1 },
    attackerBase: { level: 1 },
    actors: {
      towers: {},
      crypts: {},
      units: {},
    },
    contents: withPath,
    mapState: withPath.flat(),
    name: 'jungle',
    currentRound: 1,
    actorCount: 2, // the two bases
  };
}

test('adds 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3);
});


test("built structures show up in the MatchState", ()=> {
  const matchState = getMatchState();
  const moves = build(20, 10);
  const exec = testRun(matchState, moves);
  exec.tick();
  expect(matchState.attackerGold).toBe(100)
});