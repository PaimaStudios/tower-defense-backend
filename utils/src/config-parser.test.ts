import { builder, parser } from './config-parser';
import { MatchConfig } from './types';

describe('Input parsing', () => {
  const randomRightConfig: MatchConfig = {
    defenderBaseHealth: Math.ceil(Math.random() * 100),
    baseAttackerGoldRate: Math.ceil(Math.random() * 150),
    baseDefenderGoldRate: Math.ceil(Math.random() * 150),
    towerRepairValue: Math.ceil(Math.random() * 50),
    repairCost: Math.ceil(Math.random() * 150),
    recoupAmount: Math.ceil(Math.random() * 50),
    baseSpeed: Math.ceil(Math.random() * 20),
    healthBuffAmount: Math.ceil(Math.random() * 10), // see on gorilla crypt balance docs
    speedBuffAmount: Math.ceil(Math.random() * 10), // see on jaguar crypt balance docs
    anacondaTower: {
      1: {
        price: Math.ceil(Math.random() * 100),
        health: Math.ceil(Math.random() * 100),
        cooldown: Math.ceil(Math.random() * 30),
        damage: Math.ceil(Math.random() * 30),
        range: Math.ceil(Math.random() * 5),
      },
      2: {
        price: Math.ceil(Math.random() * 100),
        health: Math.ceil(Math.random() * 100),
        cooldown: Math.ceil(Math.random() * 30),
        damage: Math.ceil(Math.random() * 30),
        range: Math.ceil(Math.random() * 5),
      },
      3: {
        price: Math.ceil(Math.random() * 100),
        health: Math.ceil(Math.random() * 100),
        cooldown: Math.ceil(Math.random() * 30),
        damage: Math.ceil(Math.random() * 30),
        range: Math.ceil(Math.random() * 5),
      },
    },
    piranhaTower: {
      1: {
        price: Math.ceil(Math.random() * 100),
        health: Math.ceil(Math.random() * 100),
        cooldown: Math.ceil(Math.random() * 30),
        damage: Math.ceil(Math.random() * 30),
        range: Math.ceil(Math.random() * 5),
      },
      2: {
        price: Math.ceil(Math.random() * 100),
        health: Math.ceil(Math.random() * 100),
        cooldown: Math.ceil(Math.random() * 30),
        damage: Math.ceil(Math.random() * 30),
        range: Math.ceil(Math.random() * 5),
      },
      3: {
        price: Math.ceil(Math.random() * 100),
        health: Math.ceil(Math.random() * 100),
        cooldown: Math.ceil(Math.random() * 30),
        damage: Math.ceil(Math.random() * 30),
        range: Math.ceil(Math.random() * 5),
      },
    },
    slothTower: {
      1: {
        price: Math.ceil(Math.random() * 100),
        health: Math.ceil(Math.random() * 100),
        cooldown: Math.ceil(Math.random() * 30),
        damage: Math.ceil(Math.random() * 30),
        range: Math.ceil(Math.random() * 5),
      },
      2: {
        price: Math.ceil(Math.random() * 100),
        health: Math.ceil(Math.random() * 100),
        cooldown: Math.ceil(Math.random() * 30),
        damage: Math.ceil(Math.random() * 30),
        range: Math.ceil(Math.random() * 5),
      },
      3: {
        price: Math.ceil(Math.random() * 100),
        health: Math.ceil(Math.random() * 100),
        cooldown: Math.ceil(Math.random() * 30),
        damage: Math.ceil(Math.random() * 30),
        range: Math.ceil(Math.random() * 5),
      },
    },
    gorillaCrypt: {
      1: {
        price: Math.ceil(Math.random() * 100),
        cryptHealth: Math.ceil(Math.random() * 100),
        buffRange: Math.ceil(Math.random() * 5), // "range"
        buffCooldown: Math.ceil(Math.random() * 30), // "shotDelay"
        spawnRate: Math.ceil(Math.random() * 20), // "spawnDelay"
        spawnCapacity: Math.ceil(Math.random() * 20), // "spawnQuantity"
        attackDamage: Math.ceil(Math.random() * 30),
        attackRange: Math.ceil(Math.random() * 5),
        attackWarmup: Math.ceil(Math.random() * 5),
        attackCooldown: Math.ceil(Math.random() * 30),
        unitSpeed: Math.ceil(Math.random() * 50),
        unitHealth: Math.ceil(Math.random() * 100),
      },
      2: {
        price: Math.ceil(Math.random() * 100), // upgrade price
        cryptHealth: Math.ceil(Math.random() * 100),
        buffRange: Math.ceil(Math.random() * 5),
        buffCooldown: Math.ceil(Math.random() * 30),
        spawnRate: Math.ceil(Math.random() * 20), // "spawnDelay"
        spawnCapacity: Math.ceil(Math.random() * 20),
        attackDamage: Math.ceil(Math.random() * 30),
        attackRange: Math.ceil(Math.random() * 5),
        attackWarmup: Math.ceil(Math.random() * 5),
        attackCooldown: Math.ceil(Math.random() * 30),
        unitSpeed: Math.ceil(Math.random() * 50),
        unitHealth: Math.ceil(Math.random() * 100),
      },
      3: {
        price: Math.ceil(Math.random() * 100),
        cryptHealth: Math.ceil(Math.random() * 100),
        buffRange: Math.ceil(Math.random() * 5),
        buffCooldown: Math.ceil(Math.random() * 30),
        spawnRate: Math.ceil(Math.random() * 20), // "spawnDelay"
        spawnCapacity: Math.ceil(Math.random() * 20),
        attackDamage: Math.ceil(Math.random() * 30),
        attackRange: Math.ceil(Math.random() * 5),
        attackWarmup: Math.ceil(Math.random() * 5),
        attackCooldown: Math.ceil(Math.random() * 30),
        unitSpeed: Math.ceil(Math.random() * 50),
        unitHealth: Math.ceil(Math.random() * 100),
      },
    },
    jaguarCrypt: {
      1: {
        price: Math.ceil(Math.random() * 100),
        cryptHealth: Math.ceil(Math.random() * 100),
        buffRange: Math.ceil(Math.random() * 5),
        buffCooldown: Math.ceil(Math.random() * 30),
        spawnRate: Math.ceil(Math.random() * 20),
        spawnCapacity: Math.ceil(Math.random() * 20),
        attackRange: Math.ceil(Math.random() * 5),
        attackWarmup: Math.ceil(Math.random() * 5),
        attackCooldown: Math.ceil(Math.random() * 30),
        attackDamage: Math.ceil(Math.random() * 30),
        unitSpeed: Math.ceil(Math.random() * 50),
        unitHealth: Math.ceil(Math.random() * 100),
      },
      2: {
        price: Math.ceil(Math.random() * 100),
        cryptHealth: Math.ceil(Math.random() * 100),
        buffRange: Math.ceil(Math.random() * 5), // "range"
        buffCooldown: Math.ceil(Math.random() * 30), // "shotDelay"
        spawnRate: Math.ceil(Math.random() * 20), // "spawnDelay"
        spawnCapacity: Math.ceil(Math.random() * 20), // "spawnQuantity"
        attackDamage: Math.ceil(Math.random() * 30),
        attackRange: Math.ceil(Math.random() * 5),
        attackWarmup: Math.ceil(Math.random() * 5),
        attackCooldown: Math.ceil(Math.random() * 30),
        unitSpeed: Math.ceil(Math.random() * 50),
        unitHealth: Math.ceil(Math.random() * 100),
      },
      3: {
        price: Math.ceil(Math.random() * 100),
        cryptHealth: Math.ceil(Math.random() * 100),
        buffRange: Math.ceil(Math.random() * 5), // "range"
        buffCooldown: Math.ceil(Math.random() * 30), // "shotDelay"
        spawnRate: Math.ceil(Math.random() * 20), // "spawnDelay"
        spawnCapacity: Math.ceil(Math.random() * 20), // "spawnQuantity"
        attackDamage: Math.ceil(Math.random() * 30),
        attackRange: Math.ceil(Math.random() * 5),
        attackWarmup: Math.ceil(Math.random() * 5),
        attackCooldown: Math.ceil(Math.random() * 30),
        unitSpeed: Math.ceil(Math.random() * 50),
        unitHealth: Math.ceil(Math.random() * 100),
      },
    },
    macawCrypt: {
      1: {
        price: Math.ceil(Math.random() * 100),
        cryptHealth: Math.ceil(Math.random() * 100),
        buffRange: Math.ceil(Math.random() * 5),
        buffCooldown: Math.ceil(Math.random() * 30),
        spawnRate: Math.ceil(Math.random() * 20),
        spawnCapacity: Math.ceil(Math.random() * 20),
        attackDamage: Math.ceil(Math.random() * 30),
        attackWarmup: Math.ceil(Math.random() * 5),
        attackCooldown: Math.ceil(Math.random() * 30),
        attackRange: Math.ceil(Math.random() * 5),
        unitSpeed: Math.ceil(Math.random() * 50),
        unitHealth: Math.ceil(Math.random() * 100),
      },
      2: {
        price: Math.ceil(Math.random() * 100),
        cryptHealth: Math.ceil(Math.random() * 100),
        buffRange: Math.ceil(Math.random() * 5), // "range"
        buffCooldown: Math.ceil(Math.random() * 30), // "shotDelay"
        spawnRate: Math.ceil(Math.random() * 20), // "spawnDelay"
        spawnCapacity: Math.ceil(Math.random() * 20), // "spawnQuantity"
        attackDamage: Math.ceil(Math.random() * 30),
        attackRange: Math.ceil(Math.random() * 5),
        attackWarmup: Math.ceil(Math.random() * 5),
        attackCooldown: Math.ceil(Math.random() * 30),
        unitSpeed: Math.ceil(Math.random() * 50),
        unitHealth: Math.ceil(Math.random() * 100),
      },
      3: {
        price: Math.ceil(Math.random() * 100),
        cryptHealth: Math.ceil(Math.random() * 100),
        buffRange: Math.ceil(Math.random() * 5), // "range"
        buffCooldown: Math.ceil(Math.random() * 30), // "shotDelay"
        spawnRate: Math.ceil(Math.random() * 20), // "spawnDelay"
        spawnCapacity: Math.ceil(Math.random() * 20), // "spawnQuantity"
        attackDamage: Math.ceil(Math.random() * 30),
        attackRange: Math.ceil(Math.random() * 5),
        attackWarmup: Math.ceil(Math.random() * 5),
        attackCooldown: Math.ceil(Math.random() * 30),
        unitSpeed: Math.ceil(Math.random() * 50),
        unitHealth: Math.ceil(Math.random() * 100),
      },
    },
  };
  const wrongConfig = {};
  test('conf', () => {
    let ok = true;
    for (let i = 0; i < 100; i++) {
      const built = builder(randomRightConfig);
      const parsed = parser(built);
      console.log(built, "built")
      console.log(parsed, "parsed")
      if ("error" in parsed) ok = false;
    }
    expect(ok).toBeTruthy();
  });
});
