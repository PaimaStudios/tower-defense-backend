import type {
  Tile,
  PathTile,
  Coordinates,
  TurnAction,
  MatchConfig,
  ActorsObject,
  UpgradeStructureAction,
  RepairStructureAction,
  DestroyStructureAction,
  MatchState,
  DefenderStructure,
  AttackerStructure,
} from '@tower-defense/utils';
import { consumer } from 'paima-engine/paima-concise';
import { parse } from '@tower-defense/utils';
import { RoundExecutor } from '../types';
import {
  MatchExecutor,
  MatchExecutor as MatchExecutorConstructor,
  RoundExecutor as RoundExecutorConstructor,
} from 'paima-engine/paima-executors';
import processTick from '@tower-defense/game-logic';
import Prando from 'paima-engine/paima-prando';
import { parseConfig } from '@tower-defense/game-logic';

export const testmap = [
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 5, 5, 5, 1, 5, 5, 5, 1, 5, 5,
  5, 1, 2, 6, 6, 6, 2, 6, 6, 6, 2, 1, 5, 1, 5, 1, 5, 1, 5, 1, 5, 1, 5, 1, 2, 6, 2, 6, 2, 6, 2, 6, 2,
  1, 5, 1, 5, 5, 5, 1, 5, 5, 5, 1, 5, 5, 6, 6, 2, 6, 6, 6, 2, 6, 2, 1, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  1, 1, 2, 2, 2, 2, 2, 2, 2, 6, 2, 1, 5, 1, 1, 1, 1, 1, 5, 5, 5, 1, 1, 1, 2, 6, 6, 6, 2, 2, 2, 6, 2,
  3, 5, 5, 5, 5, 1, 1, 5, 1, 5, 5, 5, 1, 2, 6, 2, 6, 2, 6, 6, 6, 4, 1, 5, 1, 1, 5, 1, 5, 5, 1, 1, 1,
  5, 1, 2, 6, 2, 6, 6, 6, 2, 6, 2, 1, 5, 1, 1, 5, 5, 5, 1, 1, 1, 1, 5, 5, 6, 6, 2, 2, 2, 2, 2, 6, 2,
  1, 5, 1, 1, 1, 1, 1, 1, 5, 5, 5, 1, 1, 2, 2, 2, 6, 6, 6, 2, 6, 2, 1, 5, 1, 5, 5, 5, 5, 1, 5, 1, 5,
  1, 1, 2, 6, 6, 6, 2, 6, 2, 6, 2, 1, 5, 5, 5, 1, 1, 5, 5, 5, 1, 5, 5, 5, 6, 6, 2, 2, 2, 6, 6, 6, 2,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2,
];
export function annotateMap(contents: number[], width: number): Tile[][] {
  const tiles = contents.map(c => findTile(c));
  const accBunt: Tile[][] = [];
  const reduced = tiles.reduce((acc, tile, index) => {
    const row = Math.floor(index / width);
    const existing = acc[row] || [];
    const t = { ...tile, x: row + 1 };
    acc[row] = [...existing, t];
    const y = acc[row].indexOf(t);
    acc[row][y] = { ...t, y: y + 1 };
    return acc;
  }, accBunt);
  return reduced;
}
function findTile(c: number): Tile {
  if (c === 0)
    return {
      type: 'immovableObject',
    };
  else if (c === 1)
    return {
      type: 'open',
      faction: 'defender',
    };
  else if (c === 2)
    return {
      type: 'open',
      faction: 'attacker',
    };
  else if (c === 3)
    return {
      type: 'base',
      faction: 'defender',
      // id: 1 by default
    };
  else if (c === 4)
    return {
      type: 'base',
      faction: 'attacker',
      // id: 2 by default
    };
  else if (c === 5)
    return {
      type: 'path',
      faction: 'defender',
      leadsTo: [],
      units: [],
    };
  else if (c === 6)
    return {
      type: 'path',
      faction: 'attacker',
      leadsTo: [],
      units: [],
    };
  else
    return {
      type: 'immovableObject',
    };
}
export function setPath(map: Tile[][]): Tile[][] {
  for (let [rowidx, row] of map.entries()) {
    // console.log(row, "Row")
    for (let [tileidx, tile] of row.entries()) {
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
function isPath(tile: Tile) {
  return tile?.type === 'path';
}
function isBase(tile: Tile) {
  return tile?.type === 'base' && tile?.faction === 'defender';
}

export function getFirstRound(): RoundExecutor {
  const seed = 'td';
  const rng = new Prando(seed);
  const configString = 'r|1|gr;d;105|st1;p50;h150;c10;d5;r2'; // we would get this from the db in production
  const matchConfig: MatchConfig = parseConfig(configString);
  const am = annotateMap(testmap, 22);
  const withPath = setPath(am);
  const matchState: MatchState = {
    width: 22,
    height: 13,
    defender: '0xdDA309096477b89D7066948b31aB05924981DF2B',
    attacker: '0xcede5F9E2F8eDa3B6520779427AF0d052B106B57',
    defenderGold: 500,
    attackerGold: 500,
    defenderBase: { health: 100, level: 1 },
    attackerBase: { level: 1 },
    actors: {
      towers: {},
      crypts: {},
      units: {},
    },
    mapState: withPath.flat(),
    name: 'jungle',
    currentRound: 1,
    actorCount: 2,
  };
  const moves = build(3, 10);
  return RoundExecutorConstructor.initialize(matchConfig, matchState, moves, rng, processTick);
}

export function getNewRound(roundNumber: number): RoundExecutor {
  const seed = 'td';
  const rng = new Prando(seed);
  const configString = 'r|1|gr;d;105|st1;p50;h150;c10;d5;r2'; // we would get this from the db in production
  const matchConfig: MatchConfig = parseConfig(configString);
  const am = annotateMap(testmap, 22);
  const withPath = setPath(am);
  const matchState = {
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
    actorCount: 2,
  };
  const moves = subsequentStructureEvents(matchState, 5, 5, roundNumber);
  return RoundExecutorConstructor.initialize(matchConfig, matchState, moves, rng, processTick);
}

export function build(towerCount: number, cryptCount: number, round = 1): TurnAction[] {
  const available = availableForBuilding(testmap);
  const towers: TurnAction[] = available.towers
    .sort(() => 0.5 - Math.random())
    .slice(0, towerCount)
    .map(coords => {
      return {
        round,
        action: 'build',
        x: coords.x,
        y: coords.y,
        structure: randomFromArray(['piranhaTower', 'anacondaTower', 'slothTower']),
      };
    });
  const crypts: TurnAction[] = available.crypts
    .sort(() => 0.5 - Math.random())
    .slice(0, cryptCount)
    .map(coords => {
      return {
        round,
        action: 'build',
        x: coords.x,
        y: coords.y,
        structure: randomFromArray(['macawCrypt', 'gorillaCrypt', 'jaguarCrypt']),
      };
    });
  return [...towers, ...crypts];
}
export function subsequentStructureEvents(
  m: MatchState,
  newTowerCount: number,
  newCryptCount: number,
  roundNumber: number
): TurnAction[] {
  const toBuild = build(newTowerCount, newCryptCount, roundNumber);
  const structures: Array<DefenderStructure | AttackerStructure> = [
    ...Object.values(m.actors.towers),
    ...Object.values(m.actors.crypts),
  ];
  const toUpgrade: UpgradeStructureAction[] = structures
    .filter((a, i) => i < structures.length / 2) // choosing half of the structures, can change
    .map(a => {
      return {
        round: roundNumber,
        action: 'upgrade',
        id: a.id,
      };
    });
  const toRepair: RepairStructureAction[] = structures
    .filter((a, i) => i < structures.length / 2) // choosing half of the structures, can change
    .map(a => {
      return {
        round: roundNumber,
        action: 'repair',
        id: a.id,
        value: 25, // this should be in config
      };
    });
  const toDestroy: Array<AttackerStructure | DefenderStructure> =
    [structures[Math.floor(Math.random() * (structures.length - 1))]] || []; // a single random one

  const toDestroyEvents: DestroyStructureAction[] = toDestroy.map(d => {
    return {
      round: roundNumber,
      action: 'destroy',
      id: d.id,
    };
  });
  return [...toBuild, ...toUpgrade, ...toRepair, ...toDestroyEvents];
}
function randomFromArray<T>(array: T[]): T {
  const index = Math.floor(Math.random() * array.length);
  return array[index];
}
function availableForBuilding(map: number[]): { towers: Coordinates[]; crypts: Coordinates[] } {
  let towers = [];
  let crypts = [];
  for (let [i, cell] of map.entries()) {
    const row = Math.floor(i / 22);
    const col = i - row * 22;
    if (cell === 1) towers.push({ x: col, y: row });
    else if (cell === 2) crypts.push({ x: col, y: row });
  }
  return { towers, crypts };
}
type ConciseValue = {
  value: string;
  isStateIdentifier?: boolean;
};
