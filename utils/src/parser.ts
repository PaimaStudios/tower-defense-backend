import P from 'parsimmon';

// Parser for Match Config Definitions
const semicolon = P.string(";");
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
  semicolon
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
  health: number;
  capacity: number;
  damage: number;
  range: number;
}
interface GorillaCrypt extends Tower{
  name: "gorillaCrypt"
}
interface JaguarCrypt extends Tower{
  name: "jaguarCrypt"
}
interface MacawCrypt extends Tower{
  name: "macawCrypt"
}
interface Capacity {capacity: number;}

export const capacity = P.seqObj<Capacity>(
  P.string("c"),
  ["capacity", P.digits.map(Number)],
  semicolon
);

export const crypt = P.seqMap(
  health,
  capacity,
  damage,
  range,
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

type ParsedSubmittedInput = AnacondaTower
| PiranhaTower
| SlothTower
| GorillaCrypt
| JaguarCrypt
| MacawCrypt
| BaseGoldRate;
const parser: P.Parser<ParsedSubmittedInput> = P.alt(baseGoldRate, anacondaTower, slothTower, piranhaTower, gorillaCrypt, jaguarCrypt, macawCrypt);

export function parse(s: string): ParsedSubmittedInput {
  try {
    const res = parser.tryParse(s);
    return res;
  } catch (e) {
    console.log(e, 'parsing failure');
    return {
      input: 'invalidString',
    };
  }
}

