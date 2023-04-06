import { builder, parser } from './config-parser';
import { MatchConfig } from './types';

describe('Input parsing', () => {
  const randomRightConfig: MatchConfig = {
    defenderBaseHealth: Math.floor(Math.random() * 100),
    baseAttackerGoldRate: Math.floor(Math.random() * 150),
    baseDefenderGoldRate: Math.floor(Math.random() * 150),
    towerRepairValue: Math.floor(Math.random() * 50),
    repairCost: Math.floor(Math.random() * 150),
    recoupAmount: Math.floor(Math.random() * 50),
    baseSpeed: Math.floor(Math.random() * 20),
    healthBuffAmount: Math.floor(Math.random() * 10), // see on gorilla crypt balance docs
    speedBuffAmount: Math.floor(Math.random() * 10), // see on jaguar crypt balance docs
    anacondaTower: {
      1: {
        price: Math.floor(Math.random() * 100),
        health: Math.floor(Math.random() * 100),
        cooldown: Math.floor(Math.random() * 30),
        damage: Math.floor(Math.random() * 30),
        range: Math.floor(Math.random() * 5),
      },
      2: {
        price: Math.floor(Math.random() * 100),
        health: Math.floor(Math.random() * 100),
        cooldown: Math.floor(Math.random() * 30),
        damage: Math.floor(Math.random() * 30),
        range: Math.floor(Math.random() * 5),
      },
      3: {
        price: Math.floor(Math.random() * 100),
        health: Math.floor(Math.random() * 100),
        cooldown: Math.floor(Math.random() * 30),
        damage: Math.floor(Math.random() * 30),
        range: Math.floor(Math.random() * 5),
      },
    },
    piranhaTower: {
      1: {
        price: Math.floor(Math.random() * 100),
        health: Math.floor(Math.random() * 100),
        cooldown: Math.floor(Math.random() * 30),
        damage: Math.floor(Math.random() * 30),
        range: Math.floor(Math.random() * 5),
      },
      2: {
        price: Math.floor(Math.random() * 100),
        health: Math.floor(Math.random() * 100),
        cooldown: Math.floor(Math.random() * 30),
        damage: Math.floor(Math.random() * 30),
        range: Math.floor(Math.random() * 5),
      },
      3: {
        price: Math.floor(Math.random() * 100),
        health: Math.floor(Math.random() * 100),
        cooldown: Math.floor(Math.random() * 30),
        damage: Math.floor(Math.random() * 30),
        range: Math.floor(Math.random() * 5),
      },
    },
    slothTower: {
      1: {
        price: Math.floor(Math.random() * 100),
        health: Math.floor(Math.random() * 100),
        cooldown: Math.floor(Math.random() * 30),
        damage: Math.floor(Math.random() * 30),
        range: Math.floor(Math.random() * 5),
      },
      2: {
        price: Math.floor(Math.random() * 100),
        health: Math.floor(Math.random() * 100),
        cooldown: Math.floor(Math.random() * 30),
        damage: Math.floor(Math.random() * 30),
        range: Math.floor(Math.random() * 5),
      },
      3: {
        price: Math.floor(Math.random() * 100),
        health: Math.floor(Math.random() * 100),
        cooldown: Math.floor(Math.random() * 30),
        damage: Math.floor(Math.random() * 30),
        range: Math.floor(Math.random() * 5),
      },
    },
    gorillaCrypt: {
      1: {
        price: Math.floor(Math.random() * 100),
        cryptHealth: Math.floor(Math.random() * 100),
        buffRange: Math.floor(Math.random() * 5), // "range"
        buffCooldown: Math.floor(Math.random() * 30), // "shotDelay"
        spawnRate: Math.floor(Math.random() * 20), // "spawnDelay"
        spawnCapacity: Math.floor(Math.random() * 20), // "spawnQuantity"
        attackDamage: Math.floor(Math.random() * 30),
        attackRange: Math.floor(Math.random() * 5),
        attackWarmup: Math.floor(Math.random() * 5),
        attackCooldown: Math.floor(Math.random() * 30),
        unitSpeed: Math.floor(Math.random() * 50),
        unitHealth: Math.floor(Math.random() * 100),
      },
      2: {
        price: Math.floor(Math.random() * 100), // upgrade price
        cryptHealth: Math.floor(Math.random() * 100),
        buffRange: Math.floor(Math.random() * 5),
        buffCooldown: Math.floor(Math.random() * 30),
        spawnRate: Math.floor(Math.random() * 20), // "spawnDelay"
        spawnCapacity: Math.floor(Math.random() * 20),
        attackDamage: Math.floor(Math.random() * 30),
        attackRange: Math.floor(Math.random() * 5),
        attackWarmup: Math.floor(Math.random() * 5),
        attackCooldown: Math.floor(Math.random() * 30),
        unitSpeed: Math.floor(Math.random() * 50),
        unitHealth: Math.floor(Math.random() * 100),
      },
      3: {
        price: Math.floor(Math.random() * 100),
        cryptHealth: Math.floor(Math.random() * 100),
        buffRange: Math.floor(Math.random() * 5),
        buffCooldown: Math.floor(Math.random() * 30),
        spawnRate: Math.floor(Math.random() * 20), // "spawnDelay"
        spawnCapacity: Math.floor(Math.random() * 20),
        attackDamage: Math.floor(Math.random() * 30),
        attackRange: Math.floor(Math.random() * 5),
        attackWarmup: Math.floor(Math.random() * 5),
        attackCooldown: Math.floor(Math.random() * 30),
        unitSpeed: Math.floor(Math.random() * 50),
        unitHealth: Math.floor(Math.random() * 100),
      },
    },
    jaguarCrypt: {
      1: {
        price: Math.floor(Math.random() * 100),
        cryptHealth: Math.floor(Math.random() * 100),
        buffRange: Math.floor(Math.random() * 5),
        buffCooldown: Math.floor(Math.random() * 30),
        spawnRate: Math.floor(Math.random() * 20),
        spawnCapacity: Math.floor(Math.random() * 20),
        attackRange: Math.floor(Math.random() * 5),
        attackWarmup: Math.floor(Math.random() * 5),
        attackCooldown: Math.floor(Math.random() * 30),
        attackDamage: Math.floor(Math.random() * 30),
        unitSpeed: Math.floor(Math.random() * 50),
        unitHealth: Math.floor(Math.random() * 100),
      },
      2: {
        price: Math.floor(Math.random() * 100),
        cryptHealth: Math.floor(Math.random() * 100),
        buffRange: Math.floor(Math.random() * 5), // "range"
        buffCooldown: Math.floor(Math.random() * 30), // "shotDelay"
        spawnRate: Math.floor(Math.random() * 20), // "spawnDelay"
        spawnCapacity: Math.floor(Math.random() * 20), // "spawnQuantity"
        attackDamage: Math.floor(Math.random() * 30),
        attackRange: Math.floor(Math.random() * 5),
        attackWarmup: Math.floor(Math.random() * 5),
        attackCooldown: Math.floor(Math.random() * 30),
        unitSpeed: Math.floor(Math.random() * 50),
        unitHealth: Math.floor(Math.random() * 100),
      },
      3: {
        price: Math.floor(Math.random() * 100),
        cryptHealth: Math.floor(Math.random() * 100),
        buffRange: Math.floor(Math.random() * 5), // "range"
        buffCooldown: Math.floor(Math.random() * 30), // "shotDelay"
        spawnRate: Math.floor(Math.random() * 20), // "spawnDelay"
        spawnCapacity: Math.floor(Math.random() * 20), // "spawnQuantity"
        attackDamage: Math.floor(Math.random() * 30),
        attackRange: Math.floor(Math.random() * 5),
        attackWarmup: Math.floor(Math.random() * 5),
        attackCooldown: Math.floor(Math.random() * 30),
        unitSpeed: Math.floor(Math.random() * 50),
        unitHealth: Math.floor(Math.random() * 100),
      },
    },
    macawCrypt: {
      1: {
        price: Math.floor(Math.random() * 100),
        cryptHealth: Math.floor(Math.random() * 100),
        buffRange: Math.floor(Math.random() * 5),
        buffCooldown: Math.floor(Math.random() * 30),
        spawnRate: Math.floor(Math.random() * 20),
        spawnCapacity: Math.floor(Math.random() * 20),
        attackDamage: Math.floor(Math.random() * 30),
        attackWarmup: Math.floor(Math.random() * 5),
        attackCooldown: Math.floor(Math.random() * 30),
        attackRange: Math.floor(Math.random() * 5),
        unitSpeed: Math.floor(Math.random() * 50),
        unitHealth: Math.floor(Math.random() * 100),
      },
      2: {
        price: Math.floor(Math.random() * 100),
        cryptHealth: Math.floor(Math.random() * 100),
        buffRange: Math.floor(Math.random() * 5), // "range"
        buffCooldown: Math.floor(Math.random() * 30), // "shotDelay"
        spawnRate: Math.floor(Math.random() * 20), // "spawnDelay"
        spawnCapacity: Math.floor(Math.random() * 20), // "spawnQuantity"
        attackDamage: Math.floor(Math.random() * 30),
        attackRange: Math.floor(Math.random() * 5),
        attackWarmup: Math.floor(Math.random() * 5),
        attackCooldown: Math.floor(Math.random() * 30),
        unitSpeed: Math.floor(Math.random() * 50),
        unitHealth: Math.floor(Math.random() * 100),
      },
      3: {
        price: Math.floor(Math.random() * 100),
        cryptHealth: Math.floor(Math.random() * 100),
        buffRange: Math.floor(Math.random() * 5), // "range"
        buffCooldown: Math.floor(Math.random() * 30), // "shotDelay"
        spawnRate: Math.floor(Math.random() * 20), // "spawnDelay"
        spawnCapacity: Math.floor(Math.random() * 20), // "spawnQuantity"
        attackDamage: Math.floor(Math.random() * 30),
        attackRange: Math.floor(Math.random() * 5),
        attackWarmup: Math.floor(Math.random() * 5),
        attackCooldown: Math.floor(Math.random() * 30),
        unitSpeed: Math.floor(Math.random() * 50),
        unitHealth: Math.floor(Math.random() * 100),
      },
    },
  };
  const wrongConfig = {};
  test('conf', () => {
    let ok = true;
    for (let i = 0; i < 100; i++) {
      const built = builder(randomRightConfig);
      const parsed = parser(built);
      if ("error" in parsed) ok = false;
    }
    expect(ok).toBeTruthy();
  });
});
