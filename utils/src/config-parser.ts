import P from 'parsimmon';
import type { CryptConfigGraph, MatchConfig, TowerConfigGraph } from './types';

function towerToConcise(t: TowerConfigGraph, top: string): string {
  return [
    top,
    '1',
    `p${t[1].price}`,
    `h${t[1].health}`,
    `c${t[1].cooldown}`,
    `d${t[1].damage}`,
    `r${t[1].range}`,
    '2',
    `p${t[2].price}`,
    `h${t[2].health}`,
    `c${t[2].cooldown}`,
    `d${t[2].damage}`,
    `r${t[2].range}`,
    '3',
    `p${t[3].price}`,
    `h${t[3].health}`,
    `c${t[3].cooldown}`,
    `d${t[3].damage}`,
    `r${t[3].range}`,
  ].join(';');
}
function cryptToConcise(c: CryptConfigGraph, top: 'gc' | 'jc' | 'mc'): string {
  return [
    top,
    '1',
    `p${c[1].price}`,
    `h${c[1].unitHealth}`,
    `r${c[1].spawnRate}`,
    `c${c[1].spawnCapacity}`,
    `d${c[1].attackDamage}`,
    `br${c[1].buffRange}`,
    `bc${c[1].buffCooldown}`,
    top === 'mc'
      ? `s${c[1].unitSpeed};ac${c[1].attackCooldown};ar${c[1].attackRange}`
      : `s${c[1].unitSpeed}`,
    '2',
    `p${c[2].price}`,
    `h${c[2].unitHealth}`,
    `r${c[2].spawnRate}`,
    `c${c[2].spawnCapacity}`,
    `d${c[2].attackDamage}`,
    `br${c[2].buffRange}`,
    `bc${c[2].buffCooldown}`,
    top === 'mc'
      ? `s${c[2].unitSpeed};ac${c[2].attackCooldown};ar${c[2].attackRange}`
      : `s${c[2].unitSpeed}`,
    '3',
    `p${c[3].price}`,
    `h${c[3].unitHealth}`,
    `r${c[3].spawnRate}`,
    `c${c[3].spawnCapacity}`,
    `d${c[3].attackDamage}`,
    `br${c[3].buffRange}`,
    `bc${c[3].buffCooldown}`,
    top === 'mc'
      ? `s${c[3].unitSpeed};ac${c[3].attackCooldown};ar${c[3].attackRange}`
      : `s${c[3].unitSpeed}`,
  ].join(';');
}
function builder(c: MatchConfig): string {
  return [
    `gs${c.baseSpeed}`,
    `bh${c.defenderBaseHealth}`,
    `gd${c.baseDefenderGoldRate}`,
    `ga${c.baseAttackerGoldRate}`,
    `md${c.maxDefenderGold}`,
    `ma${c.maxAttackerGold}`,
    `rv${c.towerRepairValue}`,
    `rc${c.repairCost}`,
    `rp${c.recoupPercentage}`,
    `hb${c.healthBuffAmount}`,
    `sb${c.speedBuffAmount}`,
    towerToConcise(c.anacondaTower, 'at'),
    towerToConcise(c.piranhaTower, 'pt'),
    towerToConcise(c.slothTower, 'st'),
    cryptToConcise(c.gorillaCrypt, 'gc'),
    cryptToConcise(c.jaguarCrypt, 'jc'),
    cryptToConcise(c.macawCrypt, 'mc'),
  ].join(';');
}

// Parser for Match Config Definitions
const semicolon = P.string(';');
interface GameSpeed {
  baseSpeed: number;
}
export const gameSpeed = P.seqObj<GameSpeed>(
  P.string('gs'),
  [
    'baseSpeed',
    P.digits.map(Number).assert(s => s > 0 && s < 101, 'game speed should be between 1 and 100'),
  ],
  semicolon
);

interface BaseHealth {
  defenderBaseHealth: number;
}
export const baseHealth = P.seqObj<BaseHealth>(
  P.string('bh'),
  [
    'defenderBaseHealth',
    P.digits
      .map(Number)
      .assert(s => s > 0 && s < 1001, 'defender base health should be between 1 and 1000'),
  ],
  semicolon
);

interface DefenderGoldRate {
  baseDefenderGoldRate: number;
}
export const defenderGoldRate = P.seqObj<DefenderGoldRate>(
  P.string('gd'),
  [
    'baseDefenderGoldRate',
    P.digits
      .map(Number)
      .assert(s => s > 0 && s < 1001, 'defender gold rate should be between 1 and 1000'),
  ],
  semicolon
);

interface AttackerGoldRate {
  baseAttackerGoldRate: number;
}
export const attackerGoldRate = P.seqObj<AttackerGoldRate>(
  P.string('ga'),
  [
    'baseAttackerGoldRate',
    P.digits
      .map(Number)
      .assert(s => s > 0 && s < 1001, 'attacker gold rate should be between 1 and 1000'),
  ],
  semicolon
);
interface MaxAttackerGold {
  maxAttackerGold: number;
}
export const maxAttackerGold = P.seqObj<MaxAttackerGold>(
  P.string('ma'),
  [
    'maxAttackerGold',
    P.digits
      .map(Number)
      .assert(s => s > 0 && s < 2001, 'max attacker gold should be between 1 and 2000'),
  ],
  semicolon
);
interface MaxDefenderGold {
  maxDefenderGold: number;
}
export const maxDefenderGold = P.seqObj<MaxDefenderGold>(
  P.string('md'),
  [
    'maxDefenderGold',
    P.digits
      .map(Number)
      .assert(s => s > 0 && s < 2001, 'max defender gold should be between 1 and 2000'),
  ],
  semicolon
);

interface RecoupPercentage {
  recoupPercentage: number;
}
export const recoupPercentage = P.seqObj<RecoupPercentage>(
  P.string('rp'),
  [
    'recoupPercentage',
    P.digits
      .map(Number)
      .assert(s => s > 0 && s <= 100, 'recoup percentage should be between 1 and 100'),
  ],
  semicolon
);

interface RepairCost {
  repairCost: number;
}
export const repairCost = P.seqObj<RepairCost>(
  P.string('rc'),
  [
    'repairCost',
    P.digits.map(Number).assert(s => s > 0 && s < 301, 'repair cost should be between 1 and 300'),
  ],
  semicolon
);
interface RepairValue {
  towerRepairValue: number;
}
export const repairValue = P.seqObj<RepairValue>(
  P.string('rv'),
  [
    'towerRepairValue',
    P.digits.map(Number).assert(s => s > 0 && s < 301, 'repair value should be between 1 and 300'),
  ],
  semicolon
);

interface HealthBuff {
  healthBuffAmount: number;
}
export const healthBuff = P.seqObj<HealthBuff>(
  P.string('hb'),
  [
    'healthBuffAmount',
    P.digits.map(Number).assert(s => s > 0 && s < 21, 'health bufffs should be between 1 and 20'),
  ],
  semicolon
);

interface SpeedBuff {
  speedBuffAmount: number;
}
export const speedBuff = P.seqObj<SpeedBuff>(
  P.string('sb'),
  [
    'speedBuffAmount',
    P.digits.map(Number).assert(s => s > 0 && s < 21, 'speed buffs should be between 1 and 20'),
  ],
  semicolon
);

// Tower Config Definitions
interface Price {
  price: number;
}
export const price = P.seqObj<Price>(
  P.string('p'),
  [
    'price',
    P.digits
      .map(Number)
      .assert(s => s > 0 && s < 301, 'structure prices should be between 1 and 300'),
  ],
  semicolon
);
interface Health {
  health: number;
}
export const health = P.seqObj<Health>(
  P.string('h'),
  [
    'health',
    P.digits.map(Number).assert(s => s > 0 && s < 501, 'tower health should be between 1 and 500'),
  ],
  semicolon
);

interface Cooldown {
  cooldown: number;
}
export const cooldown = P.seqObj<Cooldown>(
  P.string('c'),
  [
    'cooldown',
    P.digits
      .map(Number)
      .assert(s => s > 0 && s < 101, 'tower cooldown should be between 1 and 100'),
  ],
  semicolon
);

interface Damage {
  damage: number;
}
export const damage = P.seqObj<Damage>(
  P.string('d'),
  [
    'damage',
    P.digits
      .map(Number)
      .assert(s => s > 0 && s < 21, 'tower attack damage should be between 1 and 20'),
  ],
  semicolon
);
interface Range {
  range: number;
}
export const range = P.seqObj<Range>(
  P.string('r'),
  [
    'range',
    P.digits.map(Number).assert(s => s > 0 && s < 10, 'attack range should be between 1 and 9'),
  ]
  // no semicolon, it ends here
);
type UpgradeTier = 1 | 2 | 3;
export const tier = P.seqMap(
  P.digit.map(Number).assert(s => s > 0 && s < 4, 'only tiers 1, 2 and 3 exist'),
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
const at = P.seqMap(P.string('at'), semicolon, _ => ({ name: 'anacondaTower' }));
const pt = P.seqMap(P.string('pt'), semicolon, _ => ({ name: 'piranhaTower' }));
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
const gc = P.seqMap(P.string('gc'), semicolon, _ => ({ name: 'gorillaCrypt' }));
const jc = P.seqMap(P.string('jc'), semicolon, _ => ({ name: 'jaguarCrypt' }));
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
  [
    'unitHealth',
    P.digits.map(Number).assert(s => s > 0 && s < 101, 'unit health should be between 1 and 100'),
  ],
  semicolon
);
export const spawnRate = P.seqObj<SpawnRate>(
  P.string('r'),
  [
    'spawnRate',
    P.digits.map(Number).assert(s => s > 0 && s < 31, 'unit spawn rate should be between 1 and 30'),
  ],
  semicolon
);
export const spawnCapacity = P.seqObj<SpawnCapacity>(
  P.string('c'),
  [
    'spawnCapacity',
    P.digits
      .map(Number)
      .assert(s => s > 0 && s < 51, 'crypt spawn capacity should be between 1 and 50'),
  ],
  semicolon
);

interface attackDamage {
  attackDamage: number;
}
export const attackDamage = P.seqObj<attackDamage>(
  P.string('d'),
  [
    'attackDamage',
    P.digits
      .map(Number)
      .assert(s => s > 0 && s < 11, 'unit attack damage should be between 1 and 10'),
  ],
  semicolon
);

export const unitSpeed = P.seqObj<UnitSpeed>(P.string('s'), [
  'unitSpeed',
  P.digits.map(Number).assert(s => s > 0 && s < 101, 'unit speed should be between 1 and 100'),
]);
export const buffRange = P.seqObj<BuffRange>(
  P.string('br'),
  [
    'buffRange',
    P.digits.map(Number).assert(s => s > 0 && s < 6, 'buff range should be between 1 and 5'),
  ],
  semicolon
);
export const buffCooldown = P.seqObj<BuffCooldown>(
  P.string('bc'),
  [
    'buffCooldown',
    P.digits.map(Number).assert(s => s > 0 && s < 101, 'buff cooldown should be between 1 and 100'),
  ],
  semicolon
);

export const attackCooldown = P.seqObj<AttackCooldown>(
  semicolon,
  P.string('ac'),
  [
    'attackCooldown',
    P.digits
      .map(Number)
      .assert(s => s > 0 && s < 101, 'macaw attack cooldown should be between 1 and 100'),
  ],
  semicolon
);
interface attackRange {
  attackRange: number;
}
export const attackRange = P.seqObj<attackRange>(P.string('ar'), [
  'attackRange',
  P.digits.map(Number).assert(s => s > 0 && s < 6, 'macaw attack range should be between 1 and 5'),
]);
export const crypt = P.seqMap(
  price,
  unitHealth,
  spawnRate,
  spawnCapacity,
  attackDamage,
  buffRange,
  buffCooldown,
  unitSpeed,
  function (p, h, r, c, d, br, bc, s) {
    return { ...p, ...h, ...r, ...c, ...d, ...br, ...bc, ...s, attackRange: 1, attackCooldown: 1 };
  }
);
export const mcrypt = P.seqMap(
  price,
  unitHealth,
  spawnRate,
  spawnCapacity,
  attackDamage,
  buffRange,
  buffCooldown,
  unitSpeed,
  attackCooldown,
  attackRange,
  function (p, h, r, c, d, br, bc, s, ac, ar) {
    return { ...p, ...h, ...r, ...c, ...d, ...br, ...bc, ...s, ...ac, ...ar };
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
  (g, _, j, _2, m) => ({
    gorillaCrypt: g,
    jaguarCrypt: j,
    macawCrypt: m,
  })
);

interface InvalidConfig {
  error: string;
}

export type ConfigDefinition = MatchConfig | InvalidConfig;

const configParser = P.seq<any>(
  gameSpeed,
  baseHealth,
  defenderGoldRate,
  attackerGoldRate,
  maxDefenderGold,
  maxAttackerGold,
  repairValue,
  repairCost,
  recoupPercentage,
  healthBuff,
  speedBuff,
  towers,
  crypts
);

function parser(s: string): ConfigDefinition {
  try {
    const res = configParser.tryParse(s);
    return res.reduce((acc, item) => ({ ...acc, ...item }), {});
  } catch (e) {
    console.log(e, 'parsing failure');
    return {
      error: e as string,
    };
  }
}

export { builder, parser };
