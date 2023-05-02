import { builder, parser } from './config-parser';
import type { MatchConfig } from './types';

describe('Input parsing', () => {
  const randomTower = () => ({
    price: Math.ceil(1 + Math.random() * 100),
    health: Math.ceil(1 + Math.random() * 99),
    cooldown: Math.ceil(1 + Math.random() * 30),
    damage: Math.ceil(1 + Math.random() * 19),
    range: Math.ceil(1 + Math.random() * 5),
  });
  const randomCrypt = () => ({
    price: Math.ceil(1 + Math.random() * 100),
    cryptHealth: Math.ceil(1 + Math.random() * 100),
    buffRange: Math.ceil(1 + Math.random() * 4), // "range"
    buffCooldown: Math.ceil(1 + Math.random() * 19), // "shotDelay"
    spawnRate: Math.ceil(1 + Math.random() * 20), // "spawnDelay"
    spawnCapacity: Math.ceil(1 + Math.random() * 20), // "spawnQuantity"
    attackDamage: Math.ceil(1 + Math.random() * 9),
    attackRange: Math.ceil(1 + Math.random() * 4),
    attackWarmup: Math.ceil(1 + Math.random() * 5),
    attackCooldown: Math.ceil(1 + Math.random() * 30),
    unitSpeed: Math.ceil(1 + Math.random() * 49),
    unitHealth: Math.ceil(1 + Math.random() * 90),
  });
  const randomRightConfig = (): MatchConfig => ({
    defenderBaseHealth: Math.ceil(1 + Math.random() * 900),
    baseAttackerGoldRate: Math.ceil(1 + Math.random() * 950),
    baseDefenderGoldRate: Math.ceil(1 + Math.random() * 950),
    towerRepairValue: Math.ceil(1 + Math.random() * 50),
    repairCost: Math.ceil(1 + Math.random() * 150),
    recoupPercentage: Math.ceil(1 + Math.random() * 99),
    baseSpeed: Math.ceil(1 + Math.random() * 20),
    healthBuffAmount: Math.ceil(1 + Math.random() * 10), // see on gorilla crypt balance docs
    speedBuffAmount: Math.ceil(1 + Math.random() * 10), // see on jaguar crypt balance docs
    anacondaTower: {
      1: randomTower(),
      2: randomTower(),
      3: randomTower(),
    },
    piranhaTower: {
      1: randomTower(),
      2: randomTower(),
      3: randomTower(),
    },
    slothTower: {
      1: randomTower(),
      2: randomTower(),
      3: randomTower(),
    },
    gorillaCrypt: {
      1: randomCrypt(),
      2: randomCrypt(),
      3: randomCrypt(),
    },
    jaguarCrypt: {
      1: randomCrypt(),
      2: randomCrypt(),
      3: randomCrypt(),
    },
    macawCrypt: {
      1: randomCrypt(),
      2: randomCrypt(),
      3: randomCrypt(),
    },
  });
  test('conf', () => {
    let ok = true;
    for (let i = 0; i < 5; i++) {
      const built = builder(randomRightConfig());
      const parsed = parser(built);
      if ('error' in parsed) ok = false;
    }
    expect(ok).toBeTruthy();
  });
});
