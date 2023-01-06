import Prando from 'paima-engine/paima-prando';
import processTick from './index';

import { baseConfig, parseConfig } from './config';
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
  UpgradeStructureAction,
  DestroyStructureAction,
} from '@tower-defense/utils';
import { crypt } from '@tower-defense/utils/src/parser';

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

function repair(m: MatchState) {
  const structures: Array<DefenderStructure | AttackerStructure> = [
    ...Object.values(m.actors.towers),
    ...Object.values(m.actors.crypts),
  ];
  const toRepair: RepairStructureAction[] = structures.map(a => {
    return {
      round: 2,
      action: 'repair',
      id: a.id,
    };
  });
  return toRepair;
}
function upgrade(m: MatchState) {
  const structures: Array<DefenderStructure | AttackerStructure> = [
    ...Object.values(m.actors.towers),
    ...Object.values(m.actors.crypts),
  ];
  const toUpgrade: UpgradeStructureAction[] = structures.map(a => {
    return {
      round: 2,
      action: "upgrade",
      id: a.id,
    };
  });
  return toUpgrade;
}
function destroy(m: MatchState) {
  const structures: Array<DefenderStructure | AttackerStructure> = [
    ...Object.values(m.actors.towers),
    ...Object.values(m.actors.crypts),
  ];
  const toDestroy: DestroyStructureAction[] = structures.map(a => {
    return {
      round: 2,
      action: 'destroy',
      id: a.id,
    };
  });
  return toDestroy;
}
function damageTowers(m: MatchState): void {
  const towers: DefenderStructure[] = Object.values(m.actors.towers)
  for (let tower of towers){
    tower.health -= 50
  }
  // const damagedTowers = Object.entries(m.actors.towers).reduce((acc, item) => {
  //   const health = item[1].health - 50;
  //   const tower = { ...item[1], health };
  //   return { ...acc, [item[0]]: tower };
  // }, m.actors.towers);
  // return { ...m, actors: { ...m.actors, towers: damagedTowers } };
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

function getMatchConfig() {
  const configString = 'r|1|gr;d;105|st;h150;c10;d5;r2';
  const matchConfig: MatchConfig = parseConfig(configString);
  return matchConfig;
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
    const counts = [
      Object.keys(matchState.actors.crypts).length,
      Object.keys(matchState.actors.towers).length,
      matchState.actorCount,
    ];
    const numbers = [10, 10, 22];
    expect(counts).toStrictEqual(numbers);
  });
  test('repaired towers are repaired', () => {
    const matchConfig = baseConfig;
    const matchState = getMatchState();
    const moves = build(3, 0);
    const currentTick = 1;
    const randomnessGenerator = new Prando(1);
    const events = processTick(matchConfig, matchState, moves, currentTick, randomnessGenerator);
    damageTowers(matchState); // mutating
    // make copy of match state after damaging
    const towerState1: ActorGraph<DefenderStructure> = structuredClone(matchState.actors.towers);
    const moves2 = repair(matchState);
    const events2 = processTick(matchConfig, matchState, moves2, currentTick, randomnessGenerator);
    // match state here should be repaired
    // compare
    const towerHealthDiff = Object.keys(towerState1).map(tower => {
      const originalHealth = towerState1[parseInt(tower)].health;
      const newHealth = matchState.actors.towers[parseInt(tower)].health;
      return newHealth - originalHealth;
    });
    expect(towerHealthDiff).toStrictEqual([25, 25, 25]);
  });
  test('repaired crypts are repaired', () => {
    const matchConfig = baseConfig;
    const matchState = getMatchState();
    const moves = build(0, 3);;
    const randomnessGenerator = new Prando(1);
    const ticks = [...Array(10).keys()] // [0..10]
    // do a bunch of ticks so the crypts do some spawning
    for (let tick of ticks){
      processTick(matchConfig, matchState, moves, tick, randomnessGenerator);
    }
    const cryptState1: ActorGraph<AttackerStructure> = structuredClone(matchState.actors.crypts);
    const moves2 = repair(matchState);
    const events2 = processTick(matchConfig, matchState, moves2, 1, randomnessGenerator);
    // match state here should be repaired
    // compare
    const cryptSpawnedDiff = Object.keys(cryptState1).map(crypt => {
      const originalSpawned = cryptState1[parseInt(crypt)].spawned;
      const newSpawned = matchState.actors.crypts[parseInt(crypt)].spawned;
      return originalSpawned.length - newSpawned.length
    });
    expect(cryptSpawnedDiff).toStrictEqual([1, 1, 1]);
  });
  test('upgraded structures are upgraded', () => {
    const matchConfig = baseConfig;
    const matchState = getMatchState();
    const moves = build(1, 1);;
    const randomnessGenerator = new Prando(1);
    const events = processTick(matchConfig, matchState, moves, 1, randomnessGenerator);
    const cryptState1: ActorGraph<AttackerStructure> = structuredClone(matchState.actors.crypts);
    const towerState1: ActorGraph<DefenderStructure> = structuredClone(matchState.actors.towers);
    const moves2 = upgrade(matchState);
    const events2 = processTick(matchConfig, matchState, moves2, 1, randomnessGenerator);
    const cryptUpgradeDiff = Object.keys(cryptState1).map(crypt => {
      const originalState = cryptState1[parseInt(crypt)].upgrades;
      const newState = matchState.actors.crypts[parseInt(crypt)].upgrades;
      return newState - originalState
    });
    const towerUpgradeDiff = Object.keys(towerState1).map(tower => {
      const originalState = towerState1[parseInt(tower)].upgrades;
      const newState = matchState.actors.towers[parseInt(tower)].upgrades;
      return newState - originalState
    }); 
    expect([...cryptUpgradeDiff, ...towerUpgradeDiff]).toStrictEqual([1, 1])
  })
  test('destroyed structures are destroyed', () => {
    const matchConfig = baseConfig;
    const matchState = getMatchState();
    const moves = build(3, 3);;
    const randomnessGenerator = new Prando(1);
    const events = processTick(matchConfig, matchState, moves, 1, randomnessGenerator);
    const moves2 = destroy(matchState);
    const events2 = processTick(matchConfig, matchState, moves2, 1, randomnessGenerator);
    const extantTowers = Object.values(matchState.actors.towers);
    const extantCrypts = Object.values(matchState.actors.crypts);
    const totalCount = [...extantCrypts, ...extantTowers].length;
    expect(totalCount).toBe(0);
  })
});
