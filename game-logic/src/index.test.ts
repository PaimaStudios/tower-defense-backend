import Prando from 'paima-engine/paima-prando';
import processTick from './index';

import { parseConfig } from './config';
import { annotateMap, setPath } from './map-processor';
import type {
  Coordinates,
  TurnAction,
  MatchConfig,
  MatchState,
  DefenderStructure,
  AttackerStructure,
  RepairStructureAction,
  ActorGraph,
} from '@tower-defense/utils';

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

export function build(towerCount: number, cryptCount: number): TurnAction[] {
  const available = availableForBuilding(testmap);
  const towers: TurnAction[] = available.towers
    .sort(() => 0.5 - Math.random())
    .slice(0, towerCount)
    .map(coords => {
      return {
        round: 1,
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
        round: 1,
        action: 'build',
        x: coords.x,
        y: coords.y,
        structure: randomFromArray(['macawCrypt', 'gorillaCrypt', 'jaguarCrypt']),
      };
    });
  return [...towers, ...crypts];
}

function repair(m: MatchState){
  const structures: Array<DefenderStructure | AttackerStructure> = [
    ...Object.values(m.actors.towers),
    ...Object.values(m.actors.crypts),
  ];
  const toRepair: RepairStructureAction[] = structures
  .map(a => {
    return {
      round: 1,
      action: 'repair',
      id: a.id,
      value: 25, // this should be in config
    };
  });
  return toRepair
}
function damageTowers(m: MatchState): MatchState{
  const damagedTowers = Object.entries(m.actors.towers).reduce((acc, item) => {
    const health = item[1].health - 50;
    const tower = {...item[1], health}
    return {...acc, [item[0]]: tower}
  }, m.actors.towers)
  return {...m, actors: {...m.actors, towers: damagedTowers}}
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

function getMatchConfig(){
  const configString = 'r|1|gr;d;105|st;h150;c10;d5;r2';
  const matchConfig: MatchConfig = parseConfig(configString);
  return matchConfig
}

function getMatchState(): MatchState {
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
    // mapState: withPath.flat(),
    name: 'jungle',
    currentRound: 1,
    actorCount: 2, // the two bases
  };
}

describe('Game Logic', () => {
  const getTestData = () => {
    const matchConfig = getMatchConfig();
    const matchState = getMatchState();
    const moves = build(10, 10);
    const currentTick = 1;
    const randomnessGenerator = new Prando(1);
    return { matchConfig, matchState, moves, currentTick, randomnessGenerator };
  };
  // structure tests
  test('built structures show up in the match state', () => {
    const matchConfig = getMatchConfig();
    const matchState = getMatchState();
    const moves = build(10, 10);
    const currentTick = 1;
    const randomnessGenerator = new Prando(1);
    const events = processTick(matchConfig, matchState, moves, currentTick, randomnessGenerator);
    const counts = [Object.keys(matchState.actors.crypts).length, Object.keys(matchState.actors.towers).length, matchState.actorCount];
    const numbers = [10, 10, 22]
    expect(counts).toStrictEqual(numbers);
  });
  test('repaired structures are repaired', () => {
    const matchConfig = getMatchConfig();
    const matchState = getMatchState();
    const moves = build(2, 0);
    const currentTick = 1;
    const randomnessGenerator = new Prando(1);
    const events = processTick(matchConfig, matchState, moves, currentTick, randomnessGenerator);
    const towerState1: ActorGraph<DefenderStructure>  = structuredClone(matchState.actors.towers);
    const damagedMatchState = damageTowers(matchState)
    const moves2 = repair(damagedMatchState);
    const events2 = processTick(matchConfig, matchState, moves2, currentTick, randomnessGenerator);
    const towerHealthDiff = Object.keys(towerState1).map(tower => {
      const originalHealth =  towerState1[parseInt(tower)].health
      const newHealth =  matchState.actors.towers[parseInt(tower)].health
      return newHealth - originalHealth
    })
    expect(towerHealthDiff).toStrictEqual([25, 25, 25])
  });
});
