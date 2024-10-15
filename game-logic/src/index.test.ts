import Prando from '@paima/prando';
import processTick from './processTick';

import { baseConfig, parseConfig } from './config';
import type {
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
  Macaw,
} from '@tower-defense/utils';
import { generateMatchState } from './map-processor';
import { generateRandomMoves } from './ai';
import { calculateRecoupGold } from './utils';
const maps = [
  '1111111111111222222222\\r\\n1555155515551266626662\\r\\n1515151515151262626262\\r\\n1515551555155662666262\\r\\n1511111111111222222262\\r\\n1511111555111266622262\\r\\n3555511515551262626664\\r\\n1511515511151262666262\\r\\n1511555111155662222262\\r\\n1511111155511222666262\\r\\n1515555151511266626262\\r\\n1555115551555662226662\\r\\n1111111111111222222222',
  '1111111111111222222222\\r\\n1555551155551266666662\\r\\n1511151151151262222262\\r\\n1511155551151266662262\\r\\n1511111111151222262262\\r\\n1511155551155666662262\\r\\n3555151151111222222264\\r\\n1515151155555226666662\\r\\n1515551111115666222262\\r\\n1511111555511222266662\\r\\n1511111511511222262222\\r\\n1555555511555666662222\\r\\n1111111111111222222222',
  '1111111111111222222222\\r\\n1111155555111226666222\\r\\n1555551115111226226662\\r\\n1511111115155666222262\\r\\n1515555115151222222262\\r\\n1515115115551222222262\\r\\n3555115115151222266664\\r\\n1511115555155662262262\\r\\n1511111111111266662262\\r\\n1515555511111222222662\\r\\n1515111511555666222622\\r\\n1555111555511226666622\\r\\n1111111111111222222222',
  '1111111111111222222222\\r\\n1111111555111266622222\\r\\n1115551515111262626662\\r\\n1115155515155662626262\\r\\n1555111115551222666262\\r\\n1511111111111222222262\\r\\n3555555555555666666664\\r\\n1511111111111222222262\\r\\n1511155515551226662262\\r\\n1555151515151226262262\\r\\n1115151555151266262262\\r\\n1115551111155662266662\\r\\n1111111111111222222222',
  '1111111111111222222222\\r\\n1111155555116666622222\\r\\n1111151115116222622222\\r\\n1111151115116222622222\\r\\n1111151115116222622222\\r\\n3511151115126222622264\\r\\n1511151115126222622262\\r\\n1511151115126222622262\\r\\n1511151115126222622262\\r\\n1511151115566222622262\\r\\n1511151111222222622262\\r\\n1555551112222222666662\\r\\n1111111122222222222222',
  '1111111111111222222222\\r\\n1155511111155662266622\\r\\n1151511555151262262962\\r\\n1551515515151266262262\\r\\n1511555115551226662262\\r\\n1511111111111222222262\\r\\n3555555555555666666664\\r\\n1511111111111222222262\\r\\n1511555115551226662262\\r\\n1551515515151266262262\\r\\n1151511555151262262962\\r\\n1155511111155662266622\\r\\n1111111111111222222222',
  '1111111111111222222222\\r\\n1115551115551226662222\\r\\n1555155515151226266662\\r\\n1511111555155666222262\\r\\n1555111111111222222262\\r\\n1515111555111222666262\\r\\n3515155515155662626664\\r\\n1515151115151262622262\\r\\n1515551115551262626662\\r\\n1511111111111266626222\\r\\n1551155551555222226222\\r\\n1155551155515666666222\\r\\n1111111111111222222222',
  '1111111111111222222222\\r\\n1555555555555666666662\\r\\n1511111111111222222262\\r\\n1555555555555666666662\\r\\n1151111111111222222622\\r\\n1555555555555666666662\\r\\n3511111111111222222264\\r\\n1555555555555666666662\\r\\n1151111111111222222622\\r\\n1555555555555666666662\\r\\n1511111111111222222262\\r\\n1555555555555666666662\\r\\n1111111111111222222222',
  '7777777777777888888888\\r\\n7555557887555566666668\\r\\n7511758228571112222268\\r\\n7511768228671556666668\\r\\n7511768228671512222228\\r\\n3517866666687555666668\\r\\n7717822222287111222264\\r\\n3517866666687555666668\\r\\n7511768228671512222228\\r\\n7511768228671556666668\\r\\n7511758228571112222268\\r\\n7555557887555566666668\\r\\n7777777777777888888888',
  '1111111111111222222222\\r\\n1111111111111222222222\\r\\n1111111111111222222222\\r\\n1111111111111222222222\\r\\n1111111111111222222222\\r\\n1111111111111222222222\\r\\n3555555555555666666664\\r\\n1111111111111222222222\\r\\n1111111111111222222222\\r\\n1111111111111222222222\\r\\n1111111111111222222222\\r\\n1111111111111222222222\\r\\n1111111111111222222222',
];
export function build(towerCount: number, cryptCount: number, macaws = false): TurnAction[] {
  const map = maps[Math.floor(Math.random() * maps.length)]
    .replace('\\r\\n', '')
    .split('')
    .map(a => Number(a) as TileNumber);
  const available = availableForBuilding(map);
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
        structure: macaws
          ? 'macawCrypt'
          : randomFromArray(['macawCrypt', 'gorillaCrypt', 'jaguarCrypt']),
      };
    });
  return [...towers, ...crypts];
}

function repair(m: MatchState): RepairStructureAction[] {
  const towers: RepairStructureAction[] = Object.values(m.actors.towers).map(a => {
    return {
      round: 3,
      action: 'repair',
      faction: 'defender',
      id: a.id,
    };
  });
  const crypts: RepairStructureAction[] = Object.values(m.actors.crypts).map(a => {
    return {
      round: 4,
      action: 'repair',
      faction: 'attacker',
      id: a.id,
    };
  });
  return [...towers, ...crypts];
}
function upgrade(m: MatchState) {
  const towers: UpgradeStructureAction[] = Object.values(m.actors.towers).map(
    (a: DefenderStructure) => {
      return {
        round: 2,
        action: 'upgrade',
        faction: 'defender',
        id: a.id,
      };
    }
  );
  const crypts: UpgradeStructureAction[] = Object.values(m.actors.crypts).map(
    (a: AttackerStructure) => {
      return {
        round: 2,
        action: 'upgrade',
        faction: 'attacker',
        id: a.id,
      };
    }
  );
  return [...towers, ...crypts];
}
function mockSalvageAll({ actors }: MatchState) {
  const towers = Object.values(actors.towers).map((tower: DefenderStructure) => {
    const salvageAction: SalvageStructureAction = {
      round: 2,
      action: 'salvage',
      faction: 'defender',
      id: tower.id,
    };
    return salvageAction;
  });
  const crypts = Object.values(actors.crypts).map((crypt: AttackerStructure) => {
    const salvageAction: SalvageStructureAction = {
      round: 2,
      action: 'salvage',
      faction: 'attacker',
      id: crypt.id,
    };
    return salvageAction;
  });
  return [...towers, ...crypts];
}
function damageTowers(m: MatchState): void {
  const towers: DefenderStructure[] = Object.values(m.actors.towers);
  for (const tower of towers) {
    tower.health -= 50;
    if (tower.health < 0) tower.health = 1;
  }
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
  return generateMatchState(
    'defender',
    '0xdDA309096477b89D7066948b31aB05924981DF2B',
    '0xcede5F9E2F8eDa3B6520779427AF0d052B106B57',
    'fork',
    maps[Math.floor(Math.random() * maps.length)],
    baseConfig,
    new Prando(1)
  );
}
function getAttackerMatchState() {
  const base = getMatchState();
  return { ...base, currentRound: 4 };
}

describe('Game Logic', () => {
  // structure tests
  test('built structures show up in the match state', () => {
    const matchConfig = getMatchConfig();
    const matchState = getMatchState();
    matchState.defenderGold = 10_000;
    matchState.attackerGold = 10_000;
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
    matchState.defenderGold = 10_000;
    matchState.attackerGold = 10_000;
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
    matchState.defenderGold = 10_000;
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
    const ok = Object.keys(towerState1).reduce((acc, tower) => {
      const original = towerState1[parseInt(tower)];
      const nnew = matchState.actors.towers[parseInt(tower)];
      const diffOK = nnew.health - original.health === 25;
      const isMax = nnew.health === matchConfig[original.structure][original.upgrades].health;
      return diffOK || isMax ? acc : false;
    }, true);
    expect(ok).toBeTruthy();
  });
  test('upgraded structures are upgraded', () => {
    const matchConfig = baseConfig;
    const matchState = getMatchState();
    const moves = build(1, 1);
    const randomnessGenerator = new Prando(1);
    processTick(matchConfig, matchState, moves, 1, randomnessGenerator);
    const cryptState1 = structuredClone(matchState.actors.crypts);
    const towerState1 = structuredClone(matchState.actors.towers);
    const moves2 = upgrade(matchState);
    processTick(matchConfig, matchState, moves2, 1, randomnessGenerator);
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
    processTick(matchConfig, matchState, moves, 1, randomnessGenerator);
    const moves2 = mockSalvageAll(matchState);
    processTick(matchConfig, matchState, moves2, 1, randomnessGenerator);
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
    const moves = build(0, 3);
    const moneySpent = moves.reduce((price, buildEvent) => {
      if (buildEvent.action !== 'build') return price;
      else {
        const cost = matchConfig[buildEvent.structure][1].price;
        const sum = price + cost;
        return sum <= initialGold ? sum : price;
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
    const cryptState1 = structuredClone(matchState.actors.crypts);
    const towerState1 = structuredClone(matchState.actors.towers);
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
    matchState.attackerGold = 10_000;
    const randomnessGenerator = new Prando(1);
    const moves = build(0, 3);
    const events = processTick(matchConfig, matchState, moves, 1, randomnessGenerator);
    const initialGold = structuredClone(matchState.attackerGold);
    const cryptState1 = structuredClone(matchState.actors.crypts);
    const towerState1 = structuredClone(matchState.actors.towers);
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
    const crypts = structuredClone(matchState.actors.crypts);
    const moves2 = mockSalvageAll(matchState);
    const events2 = processTick(matchConfig, matchState, moves2, 1, randomnessGenerator);
    const moneyGained = Object.values(crypts).reduce((acc, item) => {
      const recouped = calculateRecoupGold(item, matchConfig);
      return acc + recouped;
    }, 0);
    expect(matchState.attackerGold).toBe(initialGold + moneyGained);
  });
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
    matchState.attackerGold = 10_000;
    const moves = build(1, 5);
    const randomnessGenerator = new Prando(1);
    const ticks = [...Array(1000).keys()].map(i => i + 1); // [0..10]
    // do a bunch of ticks so the crypts do some spawning
    const events = [];
    for (const tick of ticks) {
      if (matchState.roundEnded) break;
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

  test('random moves are generated', () => {
    const prando = new Prando(1);
    const matchConfig = getMatchConfig();
    const matchState = getMatchState();
    const moves = generateRandomMoves(matchConfig, matchState, 'defender', 1, prando);
    expect(moves.length).toBeGreaterThan(0);
  });
  test('units move forward', () => {
    const matchConfig = baseConfig;
    const matchState = getAttackerMatchState();
    const moves = build(1, 10);
    const randomnessGenerator = new Prando(1);
    const ticks = [...Array(2000).keys()].map(i => i + 1);
    // do a bunch of ticks so the crypts do some spawning
    let ok = true;
    for (const tick of ticks) {
      if (matchState.roundEnded) break;
      const events = processTick(matchConfig, matchState, moves, tick, randomnessGenerator);
      if (events) {
        const movementEvents = events.filter(
          (e: TickEvent | null): e is UnitMovementEvent => e?.eventType === 'movement'
        );
        for (const m of movementEvents) {
          const unit = matchState.actors.units[m.actorID];
          // unit might have been killed
          if (!unit) break;
          const current = unit.path.indexOf(unit.coordinates);
          const good =
            m.completion === 100
              ? m.nextCoordinates === unit.path[current]
              : m.nextCoordinates === unit.path[current + 1];
          if (!good) ok = false;
        }
      }
    }
    expect(ok).toBeTruthy();
  });

  // Damage
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
    const snapshot: Record<number, DefenderStructure> = structuredClone(matchState.actors.towers);
    const units = Object.values(matchState.actors.units);
    const events = units.map(u => {
      return damage(u, Object.values(matchState.actors.towers));
    });
    // applyEvents(matchConfig, matchState, events.flat(), 2, randomnessGenerator);
    const oldState = Object.values(snapshot)[0].health;
    const newState = Object.values(matchState.actors.towers as Record<number, DefenderStructure>)[0]
      .health;
    const diff = oldState - newState;
    expect(diff).toBe(units.length);
  });
  test('attackers keep track of last shot', () => {
    let ok = true;
    const matchConfig = baseConfig;
    const matchState = { ...getMatchState(), currentRound: 3 };
    const moves = build(2, 10, true);
    const randomnessGenerator = new Prando(1);
    // Do a whole round
    let go = true;
    let tick = 1;
    while (go) {
      const events = processTick(matchConfig, matchState, moves, tick, randomnessGenerator);
      const damages =
        events?.filter((e: TickEvent): e is DamageEvent => e.eventType === 'damage') || [];
      for (const d of damages) {
        const attacker =
          d.faction === 'attacker'
            ? (matchState.actors.units[d.sourceID] as Macaw)
            : matchState.actors.towers[d.sourceID];
        if (attacker && attacker.lastShot !== tick) {
          ok = false;
        }
      }
      tick++;
      if (!events) go = false;
    }
    expect(ok).toBeTruthy();
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
