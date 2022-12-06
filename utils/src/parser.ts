import P from 'parsimmon';

// Parser for Match Config Definitions
const semicolon = P.string(";");
interface BaseSpeed{
  name: "baseGoldRate"
  value: number;
}
export const baseSpeed = P.seqObj<BaseSpeed>(
  P.string("bs"),
  semicolon,
  ['value', P.digits.map(Number)]
).map(r => {
  return {...r, name: "baseGoldRate"}
})
interface BaseGoldRate{
  name: "baseGoldRate"
  faction: "defender" | "attacker",
  value: number;
}
export const baseGoldRate = P.seqObj<BaseGoldRate>(
  P.string("gr"),
  semicolon,
  ['faction', P.alt(P.string("a"), P.string("d")).map(value => {
    return value === "a" ? 'attacker': 'defender' 
  })],
  semicolon,
  ['value', P.digits.map(Number)]
).map(r => {
  return {...r, name: "baseGoldRate"}
})

// Tower Config Definitions
interface Health {health: number;}
export const health = P.seqObj<Health>(
  P.string("h"),
  ["health", P.digits.map(Number)],
  semicolon
)
interface Cooldown {cooldown: number;}
export const cooldown = P.seqObj<Cooldown>(
  P.string("c"),
  ["cooldown", P.digits.map(Number)],
  semicolon
);

interface Damage {damage: number;}
export const damage = P.seqObj<Damage>(
  P.string("d"),
  ["damage", P.digits.map(Number)],
  semicolon
);
interface Range {range: number;}
export const range = P.seqObj<Range>(
  P.string("r"),
  ["range", P.digits.map(Number)],
  // no semicolon, it ends here
);
interface Tower{
  health: number;
  cooldown: number;
  damage: number;
  range: number;
}
interface AnacondaTower extends Tower{
  name: "anacondaTower"
}
interface SlothTower extends Tower{
  name: "slothTower"
}
interface PiranhaTower extends Tower{
  name: "piranhaTower"
}

export const tower: P.Parser<Tower> = P.seqMap(
  health,
  cooldown,
  damage,
  range,
  function(h, c, d, r){ return {...h, ...c, ...d, ...r}}
)
const anacondaTower: P.Parser<AnacondaTower> = P.seqMap(
  P.string("at"),
  semicolon,
  tower,
  function(at, _, t){
    return {name: "anacondaTower", ...t}
  }
)
const slothTower: P.Parser<SlothTower> = P.seqMap(
  P.string("st"),
  semicolon,
  tower,
  function(at, _, t){
    return {name: "slothTower", ...t}
  }
)
const piranhaTower = P.seqMap(
  P.string("pt"),
  semicolon,
  tower,
  function(at, _, t){
    return {name: "piranhaTower", ...t}
  }
)

// crypts
interface Crypt{
  unitHealth: number;
  spawnRate: number;
  capacity: number;
  damage: number;
  unitSpeed: number;
}
interface GorillaCrypt extends Crypt{
  name: "gorillaCrypt"
}
interface JaguarCrypt extends Crypt{
  name: "jaguarCrypt"
}
interface MacawCrypt extends Crypt{
  name: "macawCrypt"
}
interface UnitHealth {unitHealth: number;}
interface Capacity {capacity: number;}
interface SpawnRate {spawnRate: number;}
interface UnitSpeed {unitSpeed: number;}

export const unitHealth = P.seqObj<UnitHealth>(
  P.string("h"),
  ["unitHealth", P.digits.map(Number)],
  semicolon
)
export const spawnRate = P.seqObj<SpawnRate>(
  P.string("r"),
  ["spawnRate", P.digits.map(Number)],
  semicolon
);
export const capacity = P.seqObj<Capacity>(
  P.string("c"),
  ["capacity", P.digits.map(Number)],
  semicolon
);
export const unitSpeed = P.seqObj<UnitSpeed>(
  P.string("s"),
  ["unitSpeed", P.digits.map(Number)]
  // no semicolon, this is the last piece
);

export const crypt = P.seqMap(
  unitHealth,
  spawnRate,
  capacity,
  damage,
  unitSpeed,
  function(h, c, d, r){ return {...h, ...c, ...d, ...r}}
)

const gorillaCrypt = P.seqMap(
  P.string("at"),
  semicolon,
  tower,
  function(at, _, t){
    return {name: "gorillaCrypt", ...t}
  }
)
const jaguarCrypt = P.seqMap(
  P.string("st"),
  semicolon,
  tower,
  function(at, _, t){
    return {name: "jaguarCrypt", ...t}
  }
)
const macawCrypt = P.seqMap(
  P.string("pt"),
  semicolon,
  tower,
  function(at, _, t){
    return {name: "macawCrypt", ...t}
  }
)

interface InvalidInput{
  error: 'invalidString'
}
type ParsedSubmittedInput = AnacondaTower
| PiranhaTower
| SlothTower
| GorillaCrypt
| JaguarCrypt
| MacawCrypt
| BaseGoldRate
| InvalidInput;
const parser: P.Parser<ParsedSubmittedInput> = P.alt(baseGoldRate, anacondaTower, slothTower, piranhaTower, gorillaCrypt, jaguarCrypt, macawCrypt);

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

