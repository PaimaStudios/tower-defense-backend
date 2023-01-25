import { consumer } from 'paima-engine/paima-concise';
import { MatchConfig, TowerConfig, CryptConfig, parse, Crypt } from '@tower-defense/utils';

const baseAnacondaTowerConfig1: TowerConfig = {
  price: 50,
  health: 16,
  cooldown: 6,
  damage: 2,
  range: 3,
};
function anacondaUpgrade2(t: TowerConfig): TowerConfig {
  return {
    ...t,
    price: Math.floor(t.price * 0.5), //  upgrade price
    health: Math.floor(t.health * 1.125),
    damage: Math.floor(t.damage * 1.5),
  };
}
function anacondaUpgrade3(t: TowerConfig): TowerConfig {
  return {
    ...t,
    price: Math.floor(t.price * 0.7), //  upgrade price
    health: Math.floor(t.health * 1.25),
    damage: Math.floor(t.damage * 2),
  };
}
const basePiranhaTowerConfig1: TowerConfig = {
  price: 55,
  health: 20,
  cooldown: 4,
  damage: 1,
  range: 4,
};
function piranhaUpgrade2(t: TowerConfig): TowerConfig {
  return {
    ...t,
    range: 5,
    price: Math.floor(t.price * 0.54), //  upgrade price
    health: Math.floor(t.health * 1.12),
  };
}
function piranhaUpgrade3(t: TowerConfig): TowerConfig {
  return {
    price: Math.floor(t.price * 0.63),
    health: Math.floor(t.health * 1.25),
    damage: Math.floor(t.damage * 2),
    range: Math.floor(t.range * 1.25),
    cooldown: t.cooldown
  };
}
const baseSlothTowerConfig1: TowerConfig = {
  price: 60,
  health: 10,
  cooldown: 10,
  damage: 3,
  range: 2,
};
function slothUpgrade2(t: TowerConfig): TowerConfig {
  return {
    ...t,
    price: Math.floor(t.price * 0.5), //  upgrade price
    health: Math.floor(t.health * 1.3),
  };
}
function slothUpgrade3(t: TowerConfig): TowerConfig {
  return {
    ...t,
    price: Math.floor(t.price * 0.67), //  upgrade price
    health: Math.floor(t.health * 1.6),
    damage: Math.floor(t.damage * 1.3),
    range: Math.floor(t.range * 1.5),
  };
}

const baseGorillaCryptConfig1: CryptConfig = {
  price: 50,
  cryptHealth: 3,
  buffRange: 3, // "range"
  buffCooldown: 1, // "shotDelay"
  spawnRate: 9, // "spawnDelay"
  spawnCapacity: 10, // "spawnQuantity"
  attackDamage: 1,
  attackRange: 3,
  attackWarmup: 10,
  attackCooldown: 20,
  unitSpeed: 11,
  unitHealth: 5,
};
function gorillaUpgrade2(c: CryptConfig): CryptConfig {
  return {
    ...c,
    price: Math.floor(c.price * 0.5),
    spawnCapacity: Math.floor(c.price * 1.5),
    unitSpeed: Math.floor(c.unitSpeed * 1.18),
    unitHealth: Math.floor(c.unitHealth * 1.5),
  };
}
function gorillaUpgrade3(c: CryptConfig): CryptConfig {
  return {
    ...c,
    price: Math.floor(c.price * 0.7),
    spawnCapacity: Math.floor(c.spawnCapacity * 1.7),
    unitSpeed: Math.floor(c.unitSpeed * 1.18),
    unitHealth: Math.floor(c.unitHealth * 1.5),
  };
}
const baseGorillaCryptConfig2: CryptConfig = {
  price: 25, // upgrade price
  cryptHealth: 3,
  buffRange: 3,
  buffCooldown: 1,
  spawnRate: 9, // "spawnDelay"
  spawnCapacity: 15,
  attackDamage: 1,
  attackRange: 3,
  attackWarmup: 10,
  attackCooldown: 20,
  unitSpeed: 13,
  unitHealth: 7,
};
const baseGorillaCryptConfig3: CryptConfig = {
  price: 35,
  cryptHealth: 3,
  buffRange: 3,
  buffCooldown: 1,
  spawnRate: 9, // "spawnDelay"
  spawnCapacity: 17,
  attackDamage: 1,
  attackRange: 3,
  attackWarmup: 10,
  attackCooldown: 20,
  unitSpeed: 13,
  unitHealth: 7,
};
const baseJaguarCryptConfig1: CryptConfig = {
  price: 60,
  cryptHealth: 3,
  buffRange: 3,
  buffCooldown: 1,
  spawnRate: 6,
  spawnCapacity: 8,
  attackRange: 1,
  attackWarmup: 10,
  attackCooldown: 20,
  attackDamage: 1,
  unitSpeed: 25,
  unitHealth: 1,
};
function jaguarUpgrade2(c: CryptConfig): CryptConfig {
  return {
    ...c,
    price: Math.floor(c.price * 0.5),
    spawnCapacity: Math.floor(c.price * 1.25),
    unitSpeed: Math.floor(c.unitSpeed * 1.32),
    unitHealth: Math.floor(c.unitHealth * 3),
    attackRange: Math.floor(c.attackRange * 3)
     // TODO wtf do Jaguars and Gorilla have an attack range over 1? 
  };
}
function jaguarUpgrade3(c: CryptConfig): CryptConfig {
  return {
    ...c,
    price: Math.floor(c.price * 0.67),
    spawnCapacity: Math.floor(c.spawnCapacity * 1.625),
    unitSpeed: Math.floor(c.unitSpeed * 1.32),
    unitHealth: Math.floor(c.unitHealth * 3),
    attackRange: Math.floor(c.attackRange * 3)
  };
}
const baseJaguarCryptConfig2: CryptConfig = {
  price: 30,
  cryptHealth: 3,
  buffRange: 3, // "range"
  buffCooldown: 1, // "shotDelay"
  spawnRate: 6, // "spawnDelay"
  spawnCapacity: 10, // "spawnQuantity"
  attackDamage: 1,
  attackRange: 3,
  attackWarmup: 10,
  attackCooldown: 20,
  unitSpeed: 33,
  unitHealth: 3,
};
const baseJaguarCryptConfig3: CryptConfig = {
  price: 40,
  cryptHealth: 3,
  buffRange: 3, // "range"
  buffCooldown: 1, // "shotDelay"
  spawnRate: 6, // "spawnDelay"
  spawnCapacity: 13, // "spawnQuantity"
  attackDamage: 1,
  attackRange: 3,
  attackWarmup: 10,
  attackCooldown: 20,
  unitSpeed: 33,
  unitHealth: 3,
};

const baseMacawCryptConfig1: CryptConfig = {
  price: 70,
  cryptHealth: 3,
  buffRange: 1,
  buffCooldown: 5,
  spawnRate: 8,
  spawnCapacity: 7,
  attackDamage: 1,
  attackWarmup: 10,
  attackCooldown: 20,
  attackRange: 2,
  unitSpeed: 17,
  unitHealth: 2,
};
function macawUpgrade2(c: CryptConfig): CryptConfig {
  return {
    ...c,
    price: Math.floor(c.price * 0.5),
    spawnCapacity: Math.floor(c.price * 1.5),
    unitSpeed: Math.floor(c.unitSpeed * 1.18),
    unitHealth: Math.floor(c.unitHealth * 2),
    attackCooldown: Math.floor(c.attackCooldown * 0.75)
  };
}
function macawUpgrade3(c: CryptConfig): CryptConfig {
  return {
    ...c,
    price: Math.floor(c.price * 0.64),
    spawnCapacity: Math.floor(c.spawnCapacity * 1.7),
    unitSpeed: Math.floor(c.unitSpeed * 1.18),
    unitHealth: Math.floor(c.unitHealth * 2),
    attackCooldown: Math.floor(c.attackCooldown * 0.75)
  };
}
const baseMacawCryptConfig2: CryptConfig = {
  price: 35,
  cryptHealth: 3,
  buffRange: 3, // "range"
  buffCooldown: 1, // "shotDelay"
  spawnRate: 8, // "spawnDelay"
  spawnCapacity: 9, // "spawnQuantity"
  attackDamage: 1,
  attackRange: 2,
  attackWarmup: 5,
  attackCooldown: 15,
  unitSpeed: 20,
  unitHealth: 4,
};
const baseMacawCryptConfig3: CryptConfig = {
  price: 45,
  cryptHealth: 3,
  buffRange: 3, // "range"
  buffCooldown: 1, // "shotDelay"
  spawnRate: 8, // "spawnDelay"
  spawnCapacity: 11, // "spawnQuantity"
  attackDamage: 1,
  attackRange: 3,
  attackWarmup: 5,
  attackCooldown: 15,
  unitSpeed: 20,
  unitHealth: 4,
};

const baseAnacondaTowerConfig = {
  1: baseAnacondaTowerConfig1,
  2: anacondaUpgrade2(baseAnacondaTowerConfig1),
  3: anacondaUpgrade3(baseAnacondaTowerConfig1),
};
const basePiranhaTowerConfig = {
  1: basePiranhaTowerConfig1,
  2: piranhaUpgrade2(basePiranhaTowerConfig1),
  3: piranhaUpgrade3(basePiranhaTowerConfig1),
};
const baseSlothTowerConfig = {
  1: baseSlothTowerConfig1,
  2: slothUpgrade2(baseSlothTowerConfig1),
  3: slothUpgrade3(baseSlothTowerConfig1),
};

const baseGorillaCryptConfig = {
  1: baseGorillaCryptConfig1,
  2: gorillaUpgrade2(baseGorillaCryptConfig1),
  3: baseGorillaCryptConfig3,
};
const baseJaguarCryptConfig = {
  1: baseJaguarCryptConfig1,
  2: baseJaguarCryptConfig2,
  3: baseJaguarCryptConfig3,
};
const baseMacawCryptConfig = {
  1: baseMacawCryptConfig1,
  2: baseMacawCryptConfig2,
  3: baseMacawCryptConfig3,
};
export const baseConfig: MatchConfig = {
  baseAttackerGoldRate: 100,
  baseDefenderGoldRate: 225,
  towerRepairValue: 25,
  repairCost: 10,
  recoupAmount: 20,
  baseSpeed: 10,
  anacondaTower: baseAnacondaTowerConfig,
  piranhaTower: basePiranhaTowerConfig,
  slothTower: baseSlothTowerConfig,
  macawCrypt: baseMacawCryptConfig,
  gorillaCrypt: baseGorillaCryptConfig,
  jaguarCrypt: baseJaguarCryptConfig,
};
export function parseConfig(s: string): MatchConfig {
  // "r|1|gr;d;105|st;h150;c6;d5;r2
  const c = consumer.initialize(s);
  const version = c.nextValue();
  const definitions = c.remainingValues();
  const parsed = definitions.map(d => parse(d.value));
  for (let p of parsed) {
    if (!('error' in p))
      switch (p.name) {
        case 'baseGoldRate':
          p.faction === 'defender'
            ? (baseConfig.baseDefenderGoldRate = p.value)
            : (baseConfig.baseAttackerGoldRate = p.value);
          break;
        case 'anacondaTower':
          baseConfig.anacondaTower[1] = { ...baseConfig.anacondaTower[1], ...p };
          baseConfig.anacondaTower[2] = anacondaUpgrade2(baseConfig.anacondaTower[1]);
          baseConfig.anacondaTower[3] = anacondaUpgrade3(baseConfig.anacondaTower[1]);
          break;
        case 'piranhaTower':
          baseConfig.piranhaTower[1] = { ...baseConfig.piranhaTower[1], ...p };
          baseConfig.piranhaTower[2] = piranhaUpgrade2(baseConfig.piranhaTower[1]);
          baseConfig.piranhaTower[3] = piranhaUpgrade3(baseConfig.piranhaTower[1]);
          break;
        case 'slothTower':
          baseConfig.slothTower[1] = { ...baseConfig.slothTower[1], ...p };
          baseConfig.slothTower[2] = slothUpgrade2(baseConfig.slothTower[1]);
          baseConfig.slothTower[3] = slothUpgrade3(baseConfig.slothTower[1]);
          break;
        case 'gorillaCrypt':
          baseConfig.gorillaCrypt[1] = { ...baseConfig.gorillaCrypt[1], ...p };
          baseConfig.gorillaCrypt[2] = gorillaUpgrade2(baseConfig.gorillaCrypt[1]);
          baseConfig.gorillaCrypt[3] = gorillaUpgrade3(baseConfig.gorillaCrypt[1]);
          break;
        case 'jaguarCrypt':
          baseConfig.jaguarCrypt[1] = { ...baseConfig.jaguarCrypt[1], ...p };
          baseConfig.jaguarCrypt[2] = jaguarUpgrade2(baseConfig.jaguarCrypt[1]);
          baseConfig.jaguarCrypt[3] = jaguarUpgrade3(baseConfig.jaguarCrypt[1]);
          break;
        case 'gorillaCrypt':
          baseConfig.macawCrypt[1] = { ...baseConfig.macawCrypt[1], ...p };
          baseConfig.macawCrypt[2] = macawUpgrade2(baseConfig.macawCrypt[1]);
          baseConfig.macawCrypt[3] = macawUpgrade3(baseConfig.macawCrypt[1]);
          break;
      }
  }
  return { ...baseConfig };
}
