import P from 'parsimmon';

// TODO
// There's 3 versions for every tower/crypt.
// We can either let users configure every single version, and so we'd have `at1;whatever;` `at2;whatever`
// Or we let them only configure the first iteration and then buff the specs by some agreed ratio on every upgrade

// Parser for Match Config Definitions
const semicolon = P.string(';');
// interface BaseSpeed {
//   name: 'baseGoldRate';
//   value: number;
// }
// const baseSpeed = P.seqObj<BaseSpeed>(P.string('bs'), semicolon, [
//   'value',
//   P.digits.map(Number),
// ]).map(r => {
//   return { ...r, name: 'baseGoldRate' };
// });
interface BaseGoldRate {
  name: 'baseGoldRate';
  faction: 'defender' | 'attacker';
  value: number;
}
const baseGoldRate = P.seqObj<BaseGoldRate>(
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
const price = P.seqObj<Price>(P.string('p'), ['price', P.digits.map(Number)], semicolon);
interface Health {
  health: number;
}
const health = P.seqObj<Health>(P.string('h'), ['health', P.digits.map(Number)], semicolon);
interface Cooldown {
  cooldown: number;
}
const cooldown = P.seqObj<Cooldown>(P.string('c'), ['cooldown', P.digits.map(Number)], semicolon);

interface Damage {
  damage: number;
}
const damage = P.seqObj<Damage>(P.string('d'), ['damage', P.digits.map(Number)], semicolon);
interface Range {
  range: number;
}
const range = P.seqObj<Range>(
  P.string('r'),
  ['range', P.digits.map(Number)]
  // no semicolon, it ends here
);
interface UpgradeTier {
  tier: 1 | 2 | 3;
}
const tier = P.seqObj<UpgradeTier>([
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

const tower: P.Parser<Tower> = P.seqMap(
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

const unitHealth = P.seqObj<UnitHealth>(
  P.string('h'),
  ['unitHealth', P.digits.map(Number)],
  semicolon
);
const spawnRate = P.seqObj<SpawnRate>(
  P.string('r'),
  ['spawnRate', P.digits.map(Number)],
  semicolon
);
const spawnCapacity = P.seqObj<SpawnCapacity>(
  P.string('c'),
  ['spawnCapacity', P.digits.map(Number)],
  semicolon
);
const unitSpeed = P.seqObj<UnitSpeed>(
  P.string('s'),
  ['unitSpeed', P.digits.map(Number)]
  // no semicolon, this is the last piece
);

const crypt = P.seqMap(
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

interface InvalidConfig {
  error: 'invalidString';
}
type ConfigDefinition =
  | AnacondaTower
  | PiranhaTower
  | SlothTower
  | GorillaCrypt
  | JaguarCrypt
  | MacawCrypt
  | BaseGoldRate
  | InvalidConfig;
const parser: P.Parser<ConfigDefinition> = P.alt(
  baseGoldRate,
  anacondaTower,
  slothTower,
  piranhaTower,
  gorillaCrypt,
  jaguarCrypt,
  macawCrypt
);

export function tryParseConfig(s: string): ConfigDefinition {
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
