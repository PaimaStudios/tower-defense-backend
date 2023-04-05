import P from 'parsimmon';
import { MatchConfig } from './types';

// Parser for Match Config Definitions
const semicolon = P.string(';');
interface GameSpeed {
  gameSpeed: number;
}
export const gameSpeed = P.seqObj<GameSpeed>(
  P.string('gs'),
  ['gameSpeed', P.digits.map(Number)],
  semicolon
);

interface BaseHealth {
  baseHealth: number;
}
export const baseHealth = P.seqObj<BaseHealth>(
  P.string('bh'),
  ['baseHealth', P.digits.map(Number)],
  semicolon
);

interface DefenderGoldRate {
  baseDefenderGoldRate: number;
}
export const defenderGoldRate = P.seqObj<DefenderGoldRate>(
  P.string('gd'),
  ['baseDefenderGoldRate', P.digits.map(Number)],
  semicolon
);

interface AttackerGoldRate {
  baseAttackerGoldRate: number;
}
export const attackerGoldRate = P.seqObj<AttackerGoldRate>(
  P.string('ga'),
  ['baseAttackerGoldRate', P.digits.map(Number)],
  semicolon
);

interface RecoupAmount {
  recoupAmount: number;
}
export const recoupAmount = P.seqObj<RecoupAmount>(
  P.string('ra'),
  ['recoupAmount', P.digits.map(Number)],
  semicolon
);

interface RepairCost {
  repairCost: number;
}
export const repairCost = P.seqObj<RepairCost>(
  P.string('rc'),
  ['repairCost', P.digits.map(Number)],
  semicolon
);
interface RepairValue {
  towerRepairValue: number;
}
export const repairValue = P.seqObj<RepairValue>(
  P.string('rv'),
  ['towerRepairValue', P.digits.map(Number)],
  semicolon
);

interface HealthBuff {
  healthBuff: number;
}
export const healthBuff = P.seqObj<HealthBuff>(
  P.string('hb'),
  ['healthBuff', P.digits.map(Number)],
  semicolon
);

interface SpeedBuff {
  speedBuff: number;
}
export const speedBuff = P.seqObj<SpeedBuff>(
  P.string('sb'),
  ['speedBuff', P.digits.map(Number)],
  semicolon
);

// Tower Config Definitions
interface Price {
  price: number;
}
export const price = P.seqObj<Price>(P.string('p'), ['price', P.digits.map(Number)], semicolon);
interface Health {
  health: number;
}
export const health = P.seqObj<Health>(P.string('h'), ['health', P.digits.map(Number)], semicolon);

interface Cooldown {
  cooldown: number;
}
export const cooldown = P.seqObj<Cooldown>(
  P.string('c'),
  ['cooldown', P.digits.map(Number)],
  semicolon
);

interface Damage {
  damage: number;
}
export const damage = P.seqObj<Damage>(P.string('d'), ['damage', P.digits.map(Number)], semicolon);
interface Range {
  range: number;
}
export const range = P.seqObj<Range>(
  P.string('r'),
  ['range', P.digits.map(Number)]
  // no semicolon, it ends here
);
type UpgradeTier = 1 | 2 | 3;
export const tier = P.seqMap(
  P.regexp(/[1-3]/).map(n => {
    if (n === '1') return 1;
    else if (n === '2') return 2;
    else if (n === '3') return 3;
    else return 1;
  }),
  semicolon,
  (t, _) => t
);
interface Tower {
  price: number;
  health: number;
  cooldown: number;
  damage: number;
  range: number;
}
interface VersionedTower {
  1: Tower;
  2: Tower;
  3: Tower;
}
interface AnacondaTower extends VersionedTower {
  name: 'anacondaTower';
}
const at = P.seqMap(P.string('at'), semicolon, _ => ({ name: 'anacondaTower' }));

interface PiranhaTower extends VersionedTower {
  name: 'piranhaTower';
}
const pt = P.seqMap(P.string('pt'), semicolon, _ => ({ name: 'piranhaTower' }));

interface SlothTower extends VersionedTower {
  name: 'slothTower';
}
const st = P.seqMap(P.string('st'), semicolon, _ => ({ name: 'slothTower' }));

export const tower: P.Parser<Tower> = P.seqMap(
  price,
  health,
  cooldown,
  damage,
  range,
  function (p, h, c, d, r) {
    return { ...p, ...h, ...c, ...d, ...r };
  }
);
function towerConfig(towerType: P.Parser<{ name: string }>) {
  return P.seqMap(
    towerType,
    tier,
    tower,
    semicolon,
    tier,
    tower,
    semicolon,
    tier,
    tower,
    (type, tier, tower, _1, tier2, tower2, _2, tier3, tower3) => ({
      [tier]: tower,
      [tier2]: tower2,
      [tier3]: tower3,
    })
  );
}

const towers = P.seqMap(
  towerConfig(at),
  semicolon,
  towerConfig(pt),
  semicolon,
  towerConfig(st),
  semicolon,
  (at, _, pt, _2, st, _3) => {
    return {
      anacondaTower: at,
      piranhaTower: pt,
      slothTower: st,
    };
  }
);

// crypts
interface Crypt {
  price: number;
  buffRange: number;
  buffCooldown: number;
  spawnRate: number;
  spawnCapacity: number;
  attackDamage: number;
  attackCooldown: number;
  unitSpeed: number;
  unitHealth: number;
}
interface VersionedCrypt {
  1: Crypt;
  2: Crypt;
  3: Crypt;
}
interface GorillaCrypt extends VersionedCrypt {
  name: 'gorillaCrypt';
}
const gc = P.seqMap(P.string('gc'), semicolon, _ => ({ name: 'gorillaCrypt' }));
interface JaguarCrypt extends VersionedCrypt {
  name: 'jaguarCrypt';
}
const jc = P.seqMap(P.string('jc'), semicolon, _ => ({ name: 'jaguarCrypt' }));
interface MacawCrypt extends VersionedCrypt {
  name: 'macawCrypt';
}
const mc = P.seqMap(P.string('mc'), semicolon, _ => ({ name: 'macawCrypt' }));
interface UnitHealth {
  unitHealth: number;
}
interface SpawnCapacity {
  spawnCapacity: number;
}
interface SpawnRate {
  spawnRate: number;
}
interface UnitSpeed {
  unitSpeed: number;
}
interface BuffRange {
  buffRange: number;
}
interface BuffCooldown {
  buffCooldown: number;
}
interface AttackCooldown {
  attackCooldown: number;
}

export const unitHealth = P.seqObj<UnitHealth>(
  P.string('h'),
  ['unitHealth', P.digits.map(Number)],
  semicolon
);
export const spawnRate = P.seqObj<SpawnRate>(
  P.string('r'),
  ['spawnRate', P.digits.map(Number)],
  semicolon
);
export const spawnCapacity = P.seqObj<SpawnCapacity>(
  P.string('c'),
  ['spawnCapacity', P.digits.map(Number)],
  semicolon
);
export const unitSpeed = P.seqObj<UnitSpeed>(
  P.string('s'),
  ['unitSpeed', P.digits.map(Number)],
  semicolon
);
export const buffRange = P.seqObj<BuffRange>(
  P.string('s'),
  ['buffRange', P.digits.map(Number)],
  semicolon
);
export const buffCooldown = P.seqObj<BuffCooldown>(
  P.string('s'),
  ['buffCooldown', P.digits.map(Number)]
  // no semicolon, this is the last piece
);

export const attackCooldown = P.seqObj<AttackCooldown>(
  semicolon,
  P.string('ac'),
  ['attackCooldown', P.digits.map(Number)]
  // no semicolon, this is the last piece
);
export const crypt = P.seqMap(
  price,
  unitHealth,
  spawnRate,
  spawnCapacity,
  damage,
  unitSpeed,
  buffRange,
  buffCooldown,
  function (p, h, r, c, d, s, br, bc) {
    return { ...p, ...h, ...r, ...c, ...d, ...s, ...br, ...bc };
  }
);
export const mcrypt = P.seqMap(
  price,
  unitHealth,
  spawnRate,
  spawnCapacity,
  damage,
  unitSpeed,
  buffRange,
  buffCooldown,
  attackCooldown,
  function (p, h, r, c, d, s, br, bc, ac) {
    return { ...p, ...h, ...r, ...c, ...d, ...s, ...br, ...bc, ...ac };
  }
);

const gorillaCryptConfig = P.seqMap(
  gc,
  tier,
  crypt,
  semicolon,
  tier,
  crypt,
  semicolon,
  tier,
  crypt,
  function (name, tier1, crypt1, _, tier2, crypt2, _2, tier3, crypt3) {
    return { [tier1]: crypt1, [tier2]: crypt2, [tier3]: crypt3 };
  }
);

const jaguarCryptConfig = P.seqMap(
  jc,
  tier,
  crypt,
  semicolon,
  tier,
  crypt,
  semicolon,
  tier,
  crypt,
  function (name, tier1, crypt1, _, tier2, crypt2, _2, tier3, crypt3) {
    return { [tier1]: crypt1, [tier2]: crypt2, [tier3]: crypt3 };
  }
);
const macawCryptConfig = P.seqMap(
  mc,
  tier,
  mcrypt,
  semicolon,
  tier,
  mcrypt,
  semicolon,
  tier,
  mcrypt,
  function (name, tier1, crypt1, _, tier2, crypt2, _2, tier3, crypt3) {
    return { [tier1]: crypt1, [tier2]: crypt2, [tier3]: crypt3 };
  }
);

const crypts = P.seqMap(
  gorillaCryptConfig,
  semicolon,
  jaguarCryptConfig,
  semicolon,
  macawCryptConfig,
  (g, _, c, _2, m) => ({
    gorillaCrypt: g,
    jaguarCrypt: c,
    macawCryptConfig: m,
  })
);

interface InvalidConfig {
  error: 'invalidString';
}

export type ConfigDefinition = MatchConfig | InvalidConfig;

const parser = P.seq<any>(
  gameSpeed,
  baseHealth,
  defenderGoldRate,
  attackerGoldRate,
  repairValue,
  repairCost,
  recoupAmount,
  healthBuff,
  speedBuff,
  towers,
  crypts
);

export default function (s: string): ConfigDefinition {
  try {
    const res = parser.tryParse(s);
    return res.reduce((acc, item) => ({ ...acc, ...item }), {});
  } catch (e) {
    console.log(e, 'parsing failure');
    return {
      error: 'invalidString',
    };
  }
}
