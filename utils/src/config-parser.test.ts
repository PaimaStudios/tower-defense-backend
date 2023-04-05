import { builder } from 'paima-engine/paima-concise';
import parse from './config-parser';
import { CryptConfigGraph, MatchConfig, TowerConfig, TowerConfigGraph } from './types';

describe('Input parsing', () => {
  const randomRightConfig: MatchConfig = {
    defenderBaseHealth: Math.floor(Math.random()*100),
    baseAttackerGoldRate: Math.floor(Math.random()*150),
    baseDefenderGoldRate: Math.floor(Math.random()*150),
    repairValue: 25,
    repairCost: 10,
    recoupAmount: 20,
    baseSpeed: 10,
    healthBuffAmount: 5, // see on gorilla crypt balance docs
    speedBuffAmount: 10, // see on jaguar crypt balance docs
    anacondaTower: {
      1: {
        price: 50,
        health: 20,
        cooldown: 21,
        damage: 10,
        range: 2,
      },
      2: {
        price: 30,
        health: 30,
        cooldown: 25,
        damage: 15,
        range: 2,
      },
      3: {
        price: 30,
        health: 30,
        cooldown: 25,
        damage: 15,
        range: 2,
      },
    },
    piranhaTower: {
      1: {
        price: 50,
        health: 50,
        cooldown: 12,
        damage: 2,
        range: 4,
      },
      2: {
        price: 30,
        health: 75,
        cooldown: 12,
        damage: 2,
        range: 4,
      },
      3: {
        price: 40,
        health: 100,
        cooldown: 19,
        damage: 2,
        range: 4,
      },
    },
    slothTower: {
      1: {
        price: 50,
        health: 100,
        cooldown: 34,
        damage: 6,
        range: 2,
      },
      2: {
        price: 30,
        health: 150,
        cooldown: 31,
        damage: 8,
        range: 2,
      },
      3: {
        price: 40,
        health: 200,
        cooldown: 31,
        damage: 10,
        range: 2,
      },
    },
    gorillaCrypt: {
      1: {
        price: 70,
        cryptHealth: 3,
        buffRange: 3, // "range"
        buffCooldown: 1, // "shotDelay"
        spawnRate: 20, // "spawnDelay"
        spawnCapacity: 10, // "spawnQuantity"
        attackDamage: 1,
        attackRange: 3,
        attackWarmup: 10,
        attackCooldown: 20,
        unitSpeed: 4,
        unitHealth: 20,
      },
      2: {
        price: 40, // upgrade price
        cryptHealth: 3,
        buffRange: 3,
        buffCooldown: 1,
        spawnRate: 9, // "spawnDelay"
        spawnCapacity: 15,
        attackDamage: 1,
        attackRange: 3,
        attackWarmup: 10,
        attackCooldown: 20,
        unitSpeed: 5,
        unitHealth: 40,
      },
      3: {
        price: 50,
        cryptHealth: 3,
        buffRange: 3,
        buffCooldown: 1,
        spawnRate: 9, // "spawnDelay"
        spawnCapacity: 17,
        attackDamage: 1,
        attackRange: 3,
        attackWarmup: 10,
        attackCooldown: 20,
        unitSpeed: 5,
        unitHealth: 40,
      },
    },
    jaguarCrypt: {
      1: {
        price: 70,
        cryptHealth: 3,
        buffRange: 3,
        buffCooldown: 1,
        spawnRate: 10,
        spawnCapacity: 8,
        attackRange: 1,
        attackWarmup: 10,
        attackCooldown: 20,
        attackDamage: 1,
        unitSpeed: 25,
        unitHealth: 1,
      },
      2: {
        price: 40,
        cryptHealth: 3,
        buffRange: 1, // "range"
        buffCooldown: 1, // "shotDelay"
        spawnRate: 10, // "spawnDelay"
        spawnCapacity: 10, // "spawnQuantity"
        attackDamage: 1,
        attackRange: 3,
        attackWarmup: 10,
        attackCooldown: 20,
        unitSpeed: 40,
        unitHealth: 2,
      },
      3: {
        price: 50,
        cryptHealth: 3,
        buffRange: 2, // "range"
        buffCooldown: 30, // "shotDelay"
        spawnRate: 10, // "spawnDelay"
        spawnCapacity: 13, // "spawnQuantity"
        attackDamage: 1,
        attackRange: 3,
        attackWarmup: 10,
        attackCooldown: 20,
        unitSpeed: 40,
        unitHealth: 2,
      },
    },
    macawCrypt: {
      1: {
        price: 70,
        cryptHealth: 3,
        buffRange: 1,
        buffCooldown: 5,
        spawnRate: 15,
        spawnCapacity: 7,
        attackDamage: 1,
        attackWarmup: 5,
        attackCooldown: 60,
        attackRange: 1,
        unitSpeed: 10,
        unitHealth: 6,
      },
      2: {
        price: 40,
        cryptHealth: 3,
        buffRange: 3, // "range"
        buffCooldown: 1, // "shotDelay"
        spawnRate: 15, // "spawnDelay"
        spawnCapacity: 9, // "spawnQuantity"
        attackDamage: 3,
        attackRange: 2,
        attackWarmup: 5,
        attackCooldown: 40,
        unitSpeed: 11,
        unitHealth: 10,
      },
      3: {
        price: 50,
        cryptHealth: 3,
        buffRange: 3, // "range"
        buffCooldown: 30, // "shotDelay"
        spawnRate: 10, // "spawnDelay"
        spawnCapacity: 11, // "spawnQuantity"
        attackDamage: 3,
        attackRange: 2,
        attackWarmup: 5,
        attackCooldown: 40,
        unitSpeed: 11,
        unitHealth: 10,
      },
    },
  };
  const wrongConfig = {};
  function towerToConcise(t: TowerConfigGraph, top: string): string{
    return  [
      top, "1",
      `p${t[1].price}`,
      `h${t[1].health}`,
      `c${t[1].cooldown}`,
      `d${t[1].damage}`,
      `r${t[1].range}`,
      "2",
      `p${t[2].price}`,
      `h${t[2].health}`,
      `c${t[2].cooldown}`,
      `d${t[2].damage}`,
      `r${t[2].range}`,
      "3",
      `p${t[3].price}`,
      `h${t[3].health}`,
      `c${t[3].cooldown}`,
      `d${t[3].damage}`,
      `r${t[3].range}`,
    ].join(";")
  };
  function cryptToConcise(c: CryptConfigGraph, top: "gc" | "jc" | "mc"): string{
    return [top, "1",
    `p${c[1].price}`,
    `h${c[1].unitHealth}`,
    `r${c[1].spawnRate}`,
    `c${c[1].spawnCapacity}`,
    `d${c[1].attackDamage}`,
    top === "mc" ? `s${c[1].unitSpeed};ac${c[1].attackCooldown}` :`s${c[1].unitSpeed}`,
    "2",
    `p${c[2].price}`,
    `h${c[2].unitHealth}`,
    `r${c[2].spawnRate}`,
    `c${c[2].spawnCapacity}`,
    `d${c[2].attackDamage}`,
    top === "mc" ? `s${c[2].unitSpeed};ac${c[2].attackCooldown}` :`s${c[2].unitSpeed}`,
    "3",
    `p${c[3].price}`,
    `h${c[3].unitHealth}`,
    `r${c[3].spawnRate}`,
    `c${c[3].spawnCapacity}`,
    `d${c[3].attackDamage}`,
    top === "mc" ? `s${c[3].unitSpeed};ac${c[3].attackCooldown}` :`s${c[3].unitSpeed}`,
    ].join(";")
  }
  function toConcise(c: MatchConfig): string{
    return [
      `gs${c.baseSpeed}`,
      `bh${c.defenderBaseHealth}`,
      `gd${c.baseDefenderGoldRate}`,
      `ga${c.baseAttackerGoldRate}`,
      `rv${c.repairValue}`,
      `rc${c.repairCost}`,
      `ra${c.recoupAmount}`,
      `hb${c.healthBuffAmount}`,
      `sb${c.speedBuffAmount}`,
      towerToConcise(c.anacondaTower, "at"), 
      towerToConcise(c.piranhaTower, "pt"), 
      towerToConcise(c.slothTower, "st"), 
      cryptToConcise(c.gorillaCrypt, "gc"),
      cryptToConcise(c.jaguarCrypt, "jc"),
      cryptToConcise(c.macawCrypt, "mc")
    ].join(";")
  }
  test('parses', () => {
    const built = toConcise(randomRightConfig);
    console.log(built);
    const parsed = parse(built);
    expect(true).toBeTruthy();
  });
});
