import Prando from 'paima-engine/paima-prando';
import processTick, { getMap } from './index';

import { baseConfig, parseConfig } from './config';
import type {
  Coordinates,
  TurnAction,
  MatchConfig,
  MatchState,
  DefenderStructure,
  AttackerStructure,
  RepairStructureAction,
  UpgradeStructureAction,
  SalvageStructureAction,
  AttackerUnit,
  TickEvent,
  DamageEvent,
  UnitSpawnedEvent,
  UnitMovementEvent,
  TileNumber,
  PathTile,
  Tile,
} from '@tower-defense/utils';
import { crypt } from '@tower-defense/utils/src/parser';
import applyEvents from './apply';
import { fillMap } from './map-processor';

export const testmap: TileNumber[] = [
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
    .map(coordinates => {
      return {
        round: 1,
        action: 'build',
        faction: 'defender',
        coordinates,
        structure: randomFromArray(['piranhaTower', 'anacondaTower', 'slothTower']),
      };
    });
  const crypts: TurnAction[] = available.crypts
    .sort(() => 0.5 - Math.random())
    .slice(0, cryptCount)
    .map(coordinates => {
      return {
        round: 1,
        action: 'build',
        faction: 'attacker',
        coordinates,
        structure: randomFromArray(['macawCrypt', 'gorillaCrypt', 'jaguarCrypt']),
      };
    });
  return [...towers, ...crypts];
}

function repair(m: MatchState): RepairStructureAction[] {
  const towers: RepairStructureAction[] = Object.values(m.actors.towers).map(a => {
    return {
      round: 2,
      action: 'repair',
      faction: 'defender',
      id: a.id,
    };
  });
  const crypts: RepairStructureAction[] = Object.values(m.actors.crypts).map(a => {
    return {
      round: 2,
      action: 'repair',
      faction: 'attacker',
      id: a.id,
    };
  });
  return [...towers, ...crypts];
}
function upgrade(m: MatchState) {
  const towers: UpgradeStructureAction[] = Object.values(m.actors.towers).map(a => {
    return {
      round: 2,
      action: 'upgrade',
      faction: 'defender',
      id: a.id,
    };
  });
  const crypts: UpgradeStructureAction[] = Object.values(m.actors.crypts).map(a => {
    return {
      round: 2,
      action: 'upgrade',
      faction: 'attacker',
      id: a.id,
    };
  });
  return [...towers, ...crypts];
}
function salvage(c: MatchConfig, m: MatchState) {
  const towers: SalvageStructureAction[] = Object.values(m.actors.towers).map(a => {
    return {
      round: 2,
      action: 'salvage',
      faction: 'defender',
      gold: c.recoupAmount,
      id: a.id,
    };
  });
  const crypts: SalvageStructureAction[] = Object.values(m.actors.crypts).map(a => {
    return {
      round: 2,
      action: 'salvage',
      faction: 'attacker',
      gold: c.recoupAmount,
      id: a.id,
    };
  });
  return [...towers, ...crypts];
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
function availableForBuilding(map: TileNumber[]): { towers: number[]; crypts: number[] } {
  const towers: number[] = [];
  const crypts: number[] = [];
  const accumulator = { towers, crypts };
  return map.reduce((acc, item, index) => {
    if (item === 1) return { ...acc, towers: [...acc.towers, index] };
    else if (item === 2) return { ...acc, crypts: [...acc.crypts, index] };
    else return acc;
  }, accumulator);
}

function getMatchConfig() {
  const configString = 'r|1|gr;d;105|st1;p40;h150;c10;d5;r2';
  const matchConfig: MatchConfig = parseConfig(configString);
  return matchConfig;
}

function getMatchState(): MatchState {
  const map = fillMap(testmap, 22);
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
    mapState: map,
    name: 'jungle',
    currentRound: 1,
    actorCount: 2, // the two bases,
    finishedSpawning: [],
    roundEnded: false,
  };
}
function getAttackerMatchState() {
  const base = getMatchState();
  return { ...base, currentRound: 4 };
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
  // test('config parser works', () => {
  // const goodDefinitions = ['st1;p40;h150;c10;d5;r2'];
  // const badDefinitions = ['mc0;p40;h150;c10;d5;r2'];
  // const configString = 'r|1|gr;d;105|st1;p40;h150;c10;d5;r2';
  // const matchConfig: MatchConfig = parseConfig(configString);
  // TODO
  // expect(3).toBe(3);
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
  test('all paths lead to other paths', () => {
    const map = fillMap(testmap, 22);
    const paths: PathTile[] = map.filter((t: Tile): t is PathTile => t.type === 'path');
    const allArePaths = paths.reduce((acc, item) => {
      if (item.leadsTo.length < 1) return false;
      else {
        const ok = item.leadsTo.reduce((acc, i) => {
          if (map[i].type === 'path') return acc;
          else if (map[i].type === 'base' && map[i].faction === 'defender') return acc;
          else return false;
        }, true);
        return ok ? acc : false;
      }
    }, true);
    expect(allArePaths).toBeTruthy();
  });
  test('all paths lead somewhere', () => {
    const map = fillMap(testmap, 22);
    const paths = map.filter(t => t.type === 'path');
    const allLeadSomewhere = paths.reduce((acc, item) => {
      if (item.type === 'path' && item.leadsTo.length > 0) return acc;
      else return false;
    }, true);
    expect(allLeadSomewhere).toBeTruthy();
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
    const towerState1 = structuredClone(matchState.actors.towers);
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
    const matchState = getAttackerMatchState();
    const moves = build(0, 3);
    const randomnessGenerator = new Prando(1);
    const ticks = [...Array(10).keys()].map(i => i + 1); // [1..11]
    // do a bunch of ticks so the crypts do some spawning
    for (const tick of ticks) {
      processTick(matchConfig, matchState, moves, tick, randomnessGenerator);
    }
    const cryptState1 = structuredClone(matchState.actors.crypts);
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
    const cryptState1 = structuredClone(matchState.actors.crypts);
    const towerState1 = structuredClone(matchState.actors.towers);
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
  // // // gold
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
    console.log(initialGold, 'initial gold');
    const moves = build(0, 3);
    const moneySpent = moves.reduce((price, buildEvent) => {
      if (buildEvent.action !== 'build') return price;
      else {
        const cost = matchConfig[buildEvent.structure][1].price;
        return price + cost;
      }
    }, 0);
    console.log(moneySpent, 'money spent');
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
  // test('repairs spend gold', () => {
  //   const matchConfig = baseConfig;
  //   const matchState = getMatchState();
  //   const randomnessGenerator = new Prando(1);
  //   const moves = build(3, 0);
  //   const events = processTick(matchConfig, matchState, moves, 1, randomnessGenerator);
  //   const initialGold = structuredClone(matchState.defenderGold);
  //   const cryptState1: ActorGraph<AttackerStructure> = structuredClone(matchState.actors.crypts);
  //   const towerState1: ActorGraph<DefenderStructure> = structuredClone(matchState.actors.towers);
  //   const moves2 = repair(matchState);
  //   const events2 = processTick(matchConfig, matchState, moves2, 1, randomnessGenerator);
  //   const uEvents = events2 || [];
  //   const moneySpent = uEvents.reduce((acc, item) => {
  //     if (item.eventType === 'repair') return acc + matchConfig.repairCost;
  //     else return acc;
  //   }, 0);
  //   expect(matchState.defenderGold).toBe(initialGold - moneySpent);
  // });
  // test('upgrades spend gold', () => {
  //   const matchConfig = baseConfig;
  //   const matchState = getMatchState();
  //   const randomnessGenerator = new Prando(1);
  //   const moves = build(0, 3);
  //   const events = processTick(matchConfig, matchState, moves, 1, randomnessGenerator);
  //   const initialGold = structuredClone(matchState.attackerGold);
  //   const cryptState1: ActorGraph<AttackerStructure> = structuredClone(matchState.actors.crypts);
  //   const towerState1: ActorGraph<DefenderStructure> = structuredClone(matchState.actors.towers);
  //   const moves2 = upgrade(matchState);
  //   const events2 = processTick(matchConfig, matchState, moves2, 1, randomnessGenerator);
  //   const moneySpent = moves2.reduce((acc, item) => {
  //     const structure: AttackerStructure = matchState.actors.crypts[item.id];
  //     const cost = matchConfig[structure.structure][structure.upgrades].price;
  //     return acc + cost;
  //   }, 0);
  //   expect(matchState.attackerGold).toBe(initialGold - moneySpent);
  // });
  // test('salvaged structures recoups money', () => {
  //   const matchConfig = baseConfig;
  //   const matchState = getMatchState();
  //   const randomnessGenerator = new Prando(1);
  //   const moves = build(0, 3);
  //   const events = processTick(matchConfig, matchState, moves, 1, randomnessGenerator);
  //   const initialGold = structuredClone(matchState.attackerGold);
  //   const moves2 = salvage(matchConfig, matchState);
  //   const events2 = processTick(matchConfig, matchState, moves2, 1, randomnessGenerator);
  //   const moneyGained = moves2.reduce((acc, item) => {
  //     return acc + matchConfig.recoupAmount;
  //   }, 0);
  //   expect(matchState.attackerGold).toBe(initialGold + moneyGained);
  // });
  // // // movement
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
  test('crypts stop spawning once they reach their spawn limit', () => {
    const matchConfig = baseConfig;
    const matchState = getAttackerMatchState();
    const moves = build(1, 3);
    const randomnessGenerator = new Prando(1);
    const ticks = [...Array(1000).keys()].map(i => i + 1); // [0..10]
    // do a bunch of ticks so the crypts do some spawning
    const events = [];
    for (const tick of ticks) {
      events.push(processTick(matchConfig, matchState, moves, tick, randomnessGenerator));
    }
    const cs: AttackerStructure[] = Object.values(matchState.actors.crypts);
    const ok = cs.reduce((acc, item) => {
      const spawnLimit = matchConfig[item.structure][item.upgrades].spawnCapacity;
      if (item.spawned.length === spawnLimit) return acc;
      else return false;
    }, true);
    expect(ok).toBeTruthy();
  });
  test('units move forward', () => {
    const matchConfig = baseConfig;
    const matchState = getAttackerMatchState();
    const moves = build(1, 3);
    const randomnessGenerator = new Prando(1);
    const ticks = [...Array(3000).keys()].map(i => i + 1); // [0..10]
    // do a bunch of ticks so the crypts do some spawning
    let ok = true;
    for (let tick of ticks) {
      const events = processTick(matchConfig, matchState, moves, tick, randomnessGenerator);
      if (!events) console.log(tick, "tick")
      if (events) {
        const movementEvents = events.filter(
          (e: TickEvent | null): e is UnitMovementEvent => e?.eventType === 'movement'
        );
        const units = Object.values(matchState.actors.units);
        console.log(units.length, "units")
        for (let u of units) {
          const me = movementEvents.find(m => m.actorID === u.id);
          if (!me) ok = false;
        }
      }
    }
    expect(ok).toBeTruthy();
  });

  // // // damage
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
