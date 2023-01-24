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
  SalvageStructureAction,
  AttackerUnit,
  TickEvent,
  DamageEvent,
  UnitSpawnedEvent,
  UnitMovementEvent,
} from '@tower-defense/utils';
import { crypt } from '@tower-defense/utils/src/parser';
import applyEvents from './apply';

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
      action: 'upgrade',
      id: a.id,
    };
  });
  return toUpgrade;
}
function salvage(c: MatchConfig, m: MatchState) {
  const structures: Array<DefenderStructure | AttackerStructure> = [
    ...Object.values(m.actors.towers),
    ...Object.values(m.actors.crypts),
  ];
  const toSalvage: SalvageStructureAction[] = structures.map(a => {
    return {
      round: 2,
      action: 'salvage',
      id: a.id,
      gold: c.recoupAmount
    };
  });
  return toSalvage;
}
function damageTowers(m: MatchState): void {
  const towers: DefenderStructure[] = Object.values(m.actors.towers);
  for (const tower of towers) {
    tower.health -= 50;
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
  const towers = [];
  const crypts = [];
  for (const [i, cell] of map.entries()) {
    const row = Math.floor(i / 22);
    const col = i - row * 22;
    if (cell === 1) towers.push({ x: col, y: row });
    else if (cell === 2) crypts.push({ x: col, y: row });
  }
  return { towers, crypts };
}

function getMatchConfig() {
  const configString = 'r|1|gr;d;105|st1;p40;h150;c10;d5;r2';
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
  // parser tests
  test('parser works', () => {
    const goodDefinitions = ['st1;p40;h150;c10;d5;r2'];
    const badDefinitions = ['mc0;p40;h150;c10;d5;r2'];
    const configString = 'r|1|gr;d;105|st0;p40;h150;c10;d5;r2';
    const matchConfig: MatchConfig = parseConfig(configString);
    // TODO
    expect(3).toBe(3);
  });
  // test('mapState and contents point to the same thing', () => {
  //   const m = getMatchState();
  //   const coords = { x: 10, y: 10 };
  //   const range = 1;
  //   const up = m.contents[coords.y - range]?.[coords.x];
  //   const coordsToIndex = (coords: Coordinates, width: number): number => {
  //     return width * coords.y + coords.x;
  //   };
  //   const up2 = m.mapState[coordsToIndex({ y: coords.y - range, x: coords.x }, m.width)];
  //   const upright = m.contents[coords.y - range]?.[coords.x + range];
  //   const upright2 =
  //     m.mapState[coordsToIndex({ y: coords.y - range, x: coords.x + range }, m.width)];
  //   const right = m.contents[coords.y]?.[coords.x + range]; //
  //   const right2 = m.mapState[coordsToIndex({ y: coords.y, x: coords.x + range }, m.width)];
  //   const downright = m.contents[coords.y + range]?.[coords.x + range]; //
  //   const downright2 =
  //     m.mapState[coordsToIndex({ y: coords.y + range, x: coords.x + range }, m.width)];
  //   const down = m.contents[coords.y + range]?.[coords.x];
  //   const down2 = m.mapState[coordsToIndex({ y: coords.y + range, x: coords.x }, m.width)];
  //   const downleft = m.contents[coords.y + range]?.[coords.x - range];
  //   const downleft2 =
  //     m.mapState[coordsToIndex({ y: coords.y + range, x: coords.x - range }, m.width)];
  //   const left = m.contents[coords.y]?.[coords.x - range];
  //   const left2 = m.mapState[coordsToIndex({ y: coords.y, x: coords.x - range }, m.width)];
  //   const upleft = m.contents[coords.y - range]?.[coords.x - range];
  //   const upleft2 =
  //     m.mapState[coordsToIndex({ y: coords.y - range, x: coords.x - range }, m.width)];
  //   const one = [up, upright, right, downright, down, downleft, left, upleft];
  //   const two = [up2, upright2, right2, downright2, down2, downleft2, left2, upleft2];
  //   expect(one).toStrictEqual(two);
  // });
  // structure tests
  test('built structures show up in the match state', () => {
    const matchConfig = getMatchConfig();
    const matchState = getMatchState();
    const moves = build(5, 5);
    const currentTick = 1;
    const randomnessGenerator = new Prando(1);
    const events = processTick(matchConfig, matchState, moves, currentTick, randomnessGenerator);
    const counts = [
      Object.keys(matchState.actors.crypts).length,
      Object.keys(matchState.actors.towers).length,
      matchState.actorCount,
    ];
    const numbers = [5, 5, 12];
    expect(counts).toStrictEqual(numbers);
  });
  test('built structures show up in the match state with their respective ids', () => {
    const matchConfig = getMatchConfig();
    const matchState = getMatchState();
    const moves = build(5, 5);
    const currentTick = 1;
    const randomnessGenerator = new Prando(1);
    const events = processTick(matchConfig, matchState, moves, currentTick, randomnessGenerator);
    const idGraph: any = { crypts: [], towers: [] };
    const uEvents = events || [];
    const ids = uEvents.reduce((acc, item) => {
      if (item.eventType === 'build' && item.structure.includes('Tower'))
        return { ...acc, towers: [...acc.towers, `${item.id}`] };
      if (item.eventType === 'build' && item.structure.includes('Crypt'))
        return { ...acc, crypts: [...acc.crypts, `${item.id}`] };
      else return acc;
    }, idGraph);
    const cryptsOK = Object.keys(matchState.actors.crypts).every(e => ids.crypts.includes(e));
    const towersOK = Object.keys(matchState.actors.towers).every(e => ids.towers.includes(e));
    expect([cryptsOK, towersOK]).toStrictEqual([true, true]);
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
    const moves = build(0, 3);
    const randomnessGenerator = new Prando(1);
    const ticks = [...Array(10).keys()].map(i => i + 1); // [1..11]
    // do a bunch of ticks so the crypts do some spawning
    for (const tick of ticks) {
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
      return originalSpawned.length - newSpawned.length;
    });
    expect(cryptSpawnedDiff).toStrictEqual([1, 1, 1]);
  });
  test('upgraded structures are upgraded', () => {
    const matchConfig = baseConfig;
    const matchState = getMatchState();
    const moves = build(1, 1);
    const randomnessGenerator = new Prando(1);
    const events = processTick(matchConfig, matchState, moves, 1, randomnessGenerator);
    const cryptState1: ActorGraph<AttackerStructure> = structuredClone(matchState.actors.crypts);
    const towerState1: ActorGraph<DefenderStructure> = structuredClone(matchState.actors.towers);
    const moves2 = upgrade(matchState);
    const events2 = processTick(matchConfig, matchState, moves2, 1, randomnessGenerator);
    const cryptUpgradeDiff = Object.keys(cryptState1).map(crypt => {
      const originalState = cryptState1[parseInt(crypt)].upgrades;
      const newState = matchState.actors.crypts[parseInt(crypt)].upgrades;
      return newState - originalState;
    });
    const towerUpgradeDiff = Object.keys(towerState1).map(tower => {
      const originalState = towerState1[parseInt(tower)].upgrades;
      const newState = matchState.actors.towers[parseInt(tower)].upgrades;
      return newState - originalState;
    });
    expect([...cryptUpgradeDiff, ...towerUpgradeDiff]).toStrictEqual([1, 1]);
  });
  test('salvaged structures are destroyed', () => {
    const matchConfig = baseConfig;
    const matchState = getMatchState();
    const moves = build(3, 3);
    const randomnessGenerator = new Prando(1);
    const events = processTick(matchConfig, matchState, moves, 1, randomnessGenerator);
    const moves2 = salvage(matchConfig, matchState);
    const events2 = processTick(matchConfig, matchState, moves2, 1, randomnessGenerator);
    const extantTowers = Object.values(matchState.actors.towers);
    const extantCrypts = Object.values(matchState.actors.crypts);
    const totalCount = [...extantCrypts, ...extantTowers].length;
    expect(totalCount).toBe(0);
  });
  // gold
  test("gold doesn't go below 0", () => {
    const matchConfig = baseConfig;
    const matchState = getMatchState();
    const randomnessGenerator = new Prando(1);
    const moves = build(50, 50);
    processTick(matchConfig, matchState, moves, 1, randomnessGenerator);
    const result = [matchState.attackerGold >= 0, matchState.defenderGold >= 0];
    expect(result).toStrictEqual([true, true]);
  });
  test("built crypts drain user's gold", () => {
    const matchConfig = baseConfig;
    const matchState = getMatchState();
    const randomnessGenerator = new Prando(1);
    const initialGold = structuredClone(matchState.attackerGold);
    const moves = build(0, 3);
    const moneySpent = moves.reduce((price, buildEvent) => {
      if (buildEvent.action !== 'build') return price;
      else {
        const cost = matchConfig[buildEvent.structure][1].price;
        return price + cost;
      }
    }, 0);
    processTick(matchConfig, matchState, moves, 1, randomnessGenerator);
    expect(matchState.attackerGold).toBe(initialGold - moneySpent);
  });
  test("built towers drain user's gold", () => {
    const matchConfig = baseConfig;
    const matchState = getMatchState();
    const randomnessGenerator = new Prando(1);
    const initialGold = structuredClone(matchState.defenderGold);
    const moves = build(3, 0);
    const moneySpent = moves.reduce((price, buildEvent) => {
      if (buildEvent.action !== 'build') return price;
      else {
        const cost = matchConfig[buildEvent.structure][1].price;
        return price + cost;
      }
    }, 0);
    processTick(matchConfig, matchState, moves, 1, randomnessGenerator);
    expect(matchState.defenderGold).toBe(initialGold - moneySpent);
  });
  test('repairs spend gold', () => {
    const matchConfig = baseConfig;
    const matchState = getMatchState();
    const randomnessGenerator = new Prando(1);
    const moves = build(3, 0);
    const events = processTick(matchConfig, matchState, moves, 1, randomnessGenerator);
    const initialGold = structuredClone(matchState.defenderGold);
    const cryptState1: ActorGraph<AttackerStructure> = structuredClone(matchState.actors.crypts);
    const towerState1: ActorGraph<DefenderStructure> = structuredClone(matchState.actors.towers);
    const moves2 = repair(matchState);
    const events2 = processTick(matchConfig, matchState, moves2, 1, randomnessGenerator);
    const uEvents = events2 || [];
    const moneySpent = uEvents.reduce((acc, item) => {
      if (item.eventType === 'repair') return acc + matchConfig.repairCost;
      else return acc;
    }, 0);
    expect(matchState.defenderGold).toBe(initialGold - moneySpent);
  });
  test('upgrades spend gold', () => {
    const matchConfig = baseConfig;
    const matchState = getMatchState();
    const randomnessGenerator = new Prando(1);
    const moves = build(0, 3);
    const events = processTick(matchConfig, matchState, moves, 1, randomnessGenerator);
    const initialGold = structuredClone(matchState.attackerGold);
    const cryptState1: ActorGraph<AttackerStructure> = structuredClone(matchState.actors.crypts);
    const towerState1: ActorGraph<DefenderStructure> = structuredClone(matchState.actors.towers);
    const moves2 = upgrade(matchState);
    const events2 = processTick(matchConfig, matchState, moves2, 1, randomnessGenerator);
    const moneySpent = moves2.reduce((acc, item) => {
      const structure: AttackerStructure = matchState.actors.crypts[item.id];
      const cost = matchConfig[structure.structure][structure.upgrades].price;
      return acc + cost;
    }, 0);
    expect(matchState.attackerGold).toBe(initialGold - moneySpent);
  });
  test('salvaged structures recoups money', () => {
    const matchConfig = baseConfig;
    const matchState = getMatchState();
    const randomnessGenerator = new Prando(1);
    const moves = build(0, 3);
    const events = processTick(matchConfig, matchState, moves, 1, randomnessGenerator);
    const initialGold = structuredClone(matchState.attackerGold);
    const moves2 = salvage(matchConfig, matchState);
    const events2 = processTick(matchConfig, matchState, moves2, 1, randomnessGenerator);
    const moneyGained = moves2.reduce((acc, item) => {
      return acc + matchConfig.recoupAmount;
    }, 0);
    expect(matchState.attackerGold).toBe(initialGold + moneyGained);
  });
  // movement
  test('spawned units show up in the actors graph', () => {
    const matchConfig = baseConfig;
    const matchState = getMatchState();
    const moves = build(1, 3);
    const randomnessGenerator = new Prando(1);
    const ticks = [...Array(10).keys()].map(i => i + 1); // [0..10]
    // do a bunch of ticks so the crypts do some spawning
    const events = [];
    for (const tick of ticks) {
      events.push(processTick(matchConfig, matchState, moves, tick, randomnessGenerator));
    }
    const spawnEvents = events
      .flat()
      .filter((e: TickEvent | null): e is UnitSpawnedEvent => e?.eventType === 'spawn');
    const ids = spawnEvents.map(e => `${e.actorID}`);
    const ok = Object.keys(matchState.actors.units).every(u => ids.includes(u));
    expect(ok).toBeTruthy();
  });
  test("units move forward", () => {
    const matchConfig = baseConfig;
    const matchState = getMatchState();
    const moves = build(1, 3);
    const randomnessGenerator = new Prando(1);
    const ticks = [...Array(10).keys()].map(i => i + 1); // [0..10]
    // do a bunch of ticks so the crypts do some spawning
    let events = [];
    for (let tick of ticks) {
      events.push(processTick(matchConfig, matchState, moves, tick, randomnessGenerator));
    }
    const movementEvents = events
      .flat()
      .filter((e: TickEvent | null): e is UnitMovementEvent => e?.eventType === "movement");
     expect(3).toStrictEqual(5);
  })

  // damage
  test('macaws attacks to towers are registered', () => {
    const matchConfig = baseConfig;
    const matchState = getMatchState();
    const moves = build(1, 3);
    const randomnessGenerator = new Prando(1);
    const ticks = [...Array(10).keys()].map(i => i + 1); // [0..10]
    // do a bunch of ticks so the crypts do some spawning
    for (const tick of ticks) {
      processTick(matchConfig, matchState, moves, tick, randomnessGenerator);
    }
    const snapshot = structuredClone(matchState.actors.towers);
    const units = Object.values(matchState.actors.units);
    const events = units.map(u => {
      return damage(u, Object.values(matchState.actors.towers));
    });
    applyEvents(matchConfig, matchState, events.flat(), 2, randomnessGenerator);
    const oldState = Object.values(snapshot)[0].health;
    const newState = Object.values(matchState.actors.towers)[0].health;
    const diff = oldState - newState;
    expect(diff).toBe(units.length);
  });
});

function damage(u: AttackerUnit, t: DefenderStructure[]): DamageEvent[] {
  return t.map(tower => {
    return {
      eventType: 'damage',
      faction: 'attacker',
      sourceID: u.id,
      targetID: tower.id,
      damageType: 'neutral',
      damageAmount: 1,
    };
  });
}
