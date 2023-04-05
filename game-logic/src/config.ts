import { consumer } from 'paima-engine/paima-concise';
import type {
  MatchConfig,
  TowerConfig,
  CryptConfig,
  Level,
  UnitType,
  RoleSetting,
  RoleSettingConcise,
  AttackerStructureType,
} from '@tower-defense/utils';
import { tryParseConfig } from '@tower-defense/utils';

const baseAnacondaTowerConfig1: TowerConfig = {
  price: 50,
  health: 20,
  cooldown: 21,
  damage: 10,
  range: 2,
};
const baseAnacondaTowerConfig2: TowerConfig = {
  price: 30,
  health: 30,
  cooldown: 25,
  damage: 15,
  range: 2,
};
const baseAnacondaTowerConfig3: TowerConfig = {
  price: 40,
  health: 40,
  cooldown: 28,
  damage: 20,
  range: 3,
};
const basePiranhaTowerConfig1: TowerConfig = {
  price: 50,
  health: 50,
  cooldown: 12,
  damage: 2,
  range: 4,
};
const basePiranhaTowerConfig2: TowerConfig = {
  price: 30,
  health: 75,
  cooldown: 12,
  damage: 2,
  range: 4,
};
const basePiranhaTowerConfig3: TowerConfig = {
  price: 40,
  health: 100,
  cooldown: 19,
  damage: 2,
  range: 4,
};
const baseSlothTowerConfig1: TowerConfig = {
  price: 50,
  health: 100,
  cooldown: 34,
  damage: 6,
  range: 2,
};
const baseSlothTowerConfig2: TowerConfig = {
  price: 30,
  health: 150,
  cooldown: 31,
  damage: 8,
  range: 2,
};
const baseSlothTowerConfig3: TowerConfig = {
  price: 40,
  health: 200,
  cooldown: 31,
  damage: 10,
  range: 2,
};
const baseGorillaCryptConfig1: CryptConfig = {
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
};
const baseGorillaCryptConfig2: CryptConfig = {
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
};
const baseGorillaCryptConfig3: CryptConfig = {
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
};
const baseJaguarCryptConfig1: CryptConfig = {
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
};
const baseJaguarCryptConfig2: CryptConfig = {
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
};
const baseJaguarCryptConfig3: CryptConfig = {
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
};

const baseMacawCryptConfig1: CryptConfig = {
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
};
const baseMacawCryptConfig2: CryptConfig = {
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
};
const baseMacawCryptConfig3: CryptConfig = {
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
};

const baseAnacondaTowerConfig = {
  1: baseAnacondaTowerConfig1,
  2: baseAnacondaTowerConfig2,
  3: baseAnacondaTowerConfig3,
};
const basePiranhaTowerConfig = {
  1: basePiranhaTowerConfig1,
  2: basePiranhaTowerConfig2,
  3: basePiranhaTowerConfig3,
};
const baseSlothTowerConfig = {
  1: baseSlothTowerConfig1,
  2: baseSlothTowerConfig2,
  3: baseSlothTowerConfig3,
};

const baseGorillaCryptConfig = {
  1: baseGorillaCryptConfig1,
  2: baseGorillaCryptConfig2,
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

export const baseGoldProduction: Record<Level, number> = {
  1: 100,
  2: 200,
  3: 400,
};

export const attackerUnitMap: Record<AttackerStructureType, UnitType> = {
  macawCrypt: 'macaw',
  jaguarCrypt: 'jaguar',
  gorillaCrypt: 'gorilla',
};

export const conciseFactionMap: Record<RoleSettingConcise, RoleSetting> = {
  a: 'attacker',
  d: 'defender',
  r: 'random',
};

export const baseConfig: MatchConfig = {
  defenderBaseHealth: 100,
  baseAttackerGoldRate: 150,
  baseDefenderGoldRate: 150,
  towerRepairValue: 25,
  repairCost: 10,
  recoupAmount: 20,
  baseSpeed: 10,
  healthBuffAmount: 5, // see on gorilla crypt balance docs
  speedBuffAmount: 10, // see on jaguar crypt balance docs
  anacondaTower: baseAnacondaTowerConfig,
  piranhaTower: basePiranhaTowerConfig,
  slothTower: baseSlothTowerConfig,
  macawCrypt: baseMacawCryptConfig,
  gorillaCrypt: baseGorillaCryptConfig,
  jaguarCrypt: baseJaguarCryptConfig,
};
//TODO: add config parser later
export function parseConfig(s: string | null): MatchConfig {
  if (!s) return baseConfig;
  if (s === 'default') return baseConfig;
  else return baseConfig;
  // else {
  //   const c = consumer.initialize(s);
  //   const version = c.nextValue();
  //   const definitions = c.remainingValues();
  //   const parsed = definitions.map(d => tryParseConfig(d.value));
  //   for (const p of parsed) {
  //     if (!('error' in p))
  //       switch (p.name) {
  //         case 'baseGoldRate':
  //           p.faction === 'defender'
  //             ? (baseConfig.baseDefenderGoldRate = p.value)
  //             : (baseConfig.baseAttackerGoldRate = p.value);
  //           break;
  //         case 'anacondaTower1':
  //           baseConfig.anacondaTower[1] = { ...baseConfig.anacondaTower[1], ...p };
  //           break;
  //         case 'anacondaTower2':
  //           baseConfig.anacondaTower[2] = { ...baseConfig.anacondaTower[2], ...p };
  //           break;
  //         case 'anacondaTower3':
  //           baseConfig.anacondaTower[3] = { ...baseConfig.anacondaTower[3], ...p };
  //           break;
  //         case 'piranhaTower1':
  //           baseConfig.piranhaTower[1] = { ...baseConfig.piranhaTower[1], ...p };
  //           break;
  //         case 'slothTower1':
  //           baseConfig.slothTower[1] = { ...baseConfig.slothTower[1], ...p };
  //           break;
  //         case 'gorillaCrypt1':
  //           baseConfig.gorillaCrypt[1] = { ...baseConfig.gorillaCrypt[1], ...p };
  //           break;
  //         case 'jaguarCrypt1':
  //           baseConfig.jaguarCrypt[1] = { ...baseConfig.jaguarCrypt[1], ...p };
  //           break;
  //         case 'macawCrypt1':
  //           baseConfig.macawCrypt[1] = { ...baseConfig.macawCrypt[1], ...p };
  //           break;
  //       }
  // }
  // } else
  // return { ...baseConfig };
}
