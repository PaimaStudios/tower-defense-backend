import P from 'parsimmon';
import { consumer } from 'paima-engine/paima-concise';
import { ConciseConsumer } from 'paima-engine/paima-concise/build/types';

// TODO
// There's 3 versions for every tower/crypt.
// We can either let users configure every single version, and so we'd have `at1;whatever;` `at2;whatever`
// Or we let them only configure the first iteration and then buff the specs by some agreed ratio on every upgrade

// Parser for Match Config Definitions
const semicolon = P.string(';');
interface BaseSpeed {
  name: 'baseGoldRate';
  value: number;
}
export const baseSpeed = P.seqObj<BaseSpeed>(P.string('bs'), semicolon, [
  'value',
  P.digits.map(Number),
]).map(r => {
  return { ...r, name: 'baseGoldRate' };
});
interface BaseGoldRate {
  name: 'baseGoldRate';
  faction: 'defender' | 'attacker';
  value: number;
}
export const baseGoldRate = P.seqObj<BaseGoldRate>(
  P.string('gr'),
  semicolon,
  [
    'faction',
    P.alt(P.string('a'), P.string('d')).map(value => {
      return value === 'a' ? 'attacker' : 'defender';
    }),
  ],
  semicolon,
  ['value', P.digits.map(Number)]
).map(r => {
  return { ...r, name: 'baseGoldRate' };
});

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
interface UpgradeTier {
  tier: 1 | 2 | 3;
}
export const tier = P.seqObj<UpgradeTier>([
  'tier',
  P.regexp(/[1-3]/).map(n => {
    if (n === '2') return 2;
    else if (n === '3') return 3;
    else return 1;
  }),
]);
interface Tower {
  price: number;
  health: number;
  cooldown: number;
  damage: number;
  range: number;
}
interface VersionedTower extends Tower {
  tier: 1 | 2 | 3;
}
interface AnacondaTower extends VersionedTower {
  name: 'anacondaTower';
}
interface SlothTower extends VersionedTower {
  name: 'slothTower';
}
interface PiranhaTower extends VersionedTower {
  name: 'piranhaTower';
}

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
const anacondaTower: P.Parser<AnacondaTower> = P.seqMap(
  P.string('at'),
  tier,
  semicolon,
  tower,
  function (at, v, _, t) {
    return { name: 'anacondaTower', ...v, ...t };
  }
);
const slothTower: P.Parser<SlothTower> = P.seqMap(
  P.string('st'),
  tier,
  semicolon,
  tower,
  function (at, v, _, t) {
    return { name: 'slothTower', ...v, ...t };
  }
);
const piranhaTower = P.seqMap(P.string('pt'), tier, semicolon, tower, function (at, v, _, t) {
  return { name: 'piranhaTower', ...v, ...t };
});

// crypts
interface Crypt {
  price: number;
  // TODO some stats seem pretty inconsequential. Revise later.
  // buffRange: number;
  // buffCooldown: number;
  spawnRate: number;
  spawnCapacity: number;
  attackDamage: number;
  // attackWarmup: number;
  // attackCooldown: number;
  unitSpeed: number;
  unitHealth: number;
}
interface VersionedCrypt extends Crypt {
  tier: 1 | 2 | 3;
}
interface GorillaCrypt extends VersionedCrypt {
  name: 'gorillaCrypt';
}
interface JaguarCrypt extends VersionedCrypt {
  name: 'jaguarCrypt';
}
interface MacawCrypt extends VersionedCrypt {
  name: 'macawCrypt';
}
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
  ['unitSpeed', P.digits.map(Number)]
  // no semicolon, this is the last piece
);

export const crypt = P.seqMap(
  unitHealth,
  spawnRate,
  spawnCapacity,
  damage,
  unitSpeed,
  function (h, c, d, r) {
    return { ...h, ...c, ...d, ...r };
  }
);

const gorillaCrypt = P.seqMap(P.string('gc'), tier, semicolon, crypt, function (at, v, _, t) {
  return { name: 'gorillaCrypt', ...v, ...t };
});
const jaguarCrypt = P.seqMap(P.string('jc'), tier, semicolon, crypt, function (at, v, _, t) {
  return { name: 'jaguarCrypt', ...v, ...t };
});
const macawCrypt = P.seqMap(P.string('mc'), tier, semicolon, crypt, function (at, v, _, t) {
  return { name: 'macawCrypt', ...v, ...t };
});

export interface InvalidInput {
  error: 'invalidString';
}
export type ParsedSubmittedInput =
  | AnacondaTower
  | PiranhaTower
  | SlothTower
  | GorillaCrypt
  | JaguarCrypt
  | MacawCrypt
  | BaseGoldRate
  | InvalidInput;
const parser: P.Parser<ParsedSubmittedInput> = P.alt(
  baseGoldRate,
  anacondaTower,
  slothTower,
  piranhaTower,
  gorillaCrypt,
  jaguarCrypt,
  macawCrypt
);

export function parse(s: string): ParsedSubmittedInput {
  try {
    const res = parser.tryParse(s);
    return res;
  } catch (e) {
    console.log(e, 'parsing failure');
    return {
      error: 'invalidString',
    };
  }
}

export function concise(s: string){
  const c = consumer.initialize(s);
  if (c.concisePrefix === "c") parseCreate(c)
  else if (c.concisePrefix === "j") parseJoin(c)
  else if (c.concisePrefix === "cs") parseClose(c)
  else if (c.concisePrefix === "s") parseSubmitTurn(c)
  else if (c.concisePrefix === "n") parseNFT(c)
  else if (c.concisePrefix === "z") parseZombie(c)
  else if (c.concisePrefix === "u") parseUserStats(c)
}
export function parseCreate(c: ConciseConsumer){
  const config = c.nextValue();
  const role = c.nextValue()
  const numOfRounds = c.nextValue();
  const roundLength = c.nextValue();
  const isHidden = c.nextValue();
  const mapName = c.nextValue();
  const isPractice = c.nextValue();
}
export function parseJoin(c: ConciseConsumer){
  const lobbyID = c.nextValue();
}
export function parseClose(c: ConciseConsumer){
  const lobbyID = c.nextValue();
}
export function parseSubmitTurn(c: ConciseConsumer){
  const lobbyID = c.nextValue();
  const roundNumber = c.nextValue();
  const actions = c.remainingValues();c
}
export function parseNFT(c: ConciseConsumer){
  const NFTAddress = c.nextValue();
  const tokenID = c.nextValue();
};
export function parseZombie(c: ConciseConsumer){
  const lobbyID = c.nextValue();
}
export function parseUserStats(c: ConciseConsumer){
  const wallet = c.nextValue();
  const result = c.nextValue();
}