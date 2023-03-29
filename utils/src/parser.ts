import P from 'parsimmon';
import { consumer } from 'paima-engine/paima-concise';
import type { ConciseConsumer, ConciseValue } from 'paima-engine/paima-concise/build/types';
import type {
  BuildStructureAction,
  RepairStructureAction,
  SalvageStructureAction,
  Structure,
  TurnAction,
  UpgradeStructureAction,
} from './types';
import { WalletAddress } from 'paima-engine/paima-utils';
// Types
export type ParsedSubmittedInput =
  | CreatedLobbyInput
  | JoinedLobbyInput
  | ClosedLobbyInput
  | SubmittedTurnInput
  | ScheduledDataInput
  | SetNFTInput
  | InvalidInput;

export interface InvalidInput {
  input: 'invalidString';
}
export type RoleSetting = 'attacker' | 'defender' | 'random';
export interface CreatedLobbyInput {
  input: 'createdLobby';
  creatorFaction: RoleSetting;
  numOfRounds: number;
  roundLength: number;
  map: Map;
  matchConfigID: string; // same format as lobby ID, 12char base 62
  isHidden: boolean;
  isPractice: boolean;
}

export interface JoinedLobbyInput {
  input: 'joinedLobby';
  lobbyID: string;
}

export interface ClosedLobbyInput {
  input: 'closedLobby';
  lobbyID: string;
}

export interface SubmittedTurnInput {
  input: 'submittedTurn';
  lobbyID: string;
  roundNumber: number;
  actions: TurnAction[];
}

export interface SetNFTInput {
  input: 'setNFT';
  address: string;
  tokenID: number;
}

export interface ScheduledDataInput {
  input: 'scheduledData';
  effect: SideEffect;
}

type SideEffect = ZombieRoundEffect | UserStatsEffect;

export interface ZombieRoundEffect {
  type: 'zombie';
  lobbyID: string;
}

export interface UserStatsEffect {
  type: 'stats';
  user: WalletAddress;
  result: 'w' | 'l';
}
export type Map = string;

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

export interface InvalidConfig {
  error: 'invalidString';
}
export type ConfigDefinition =
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
function tryParse<T>(c: ConciseValue | null, parser: P.Parser<T>): T {
  if (!c) throw 'parsing error';
  return parser.tryParse(c.value);
}
// Parser for Game Inputs read by Paima Funnel
// Base parsers
const pBase62 = P.alt(P.letter, P.digit);
const pComma = P.string(',');
const pBoolean = P.alt(P.string('T'), P.string('F'), P.string('')).map(value => {
  if (value === 'T') return true;
  return false;
});
// IDs
const pWallet = pBase62.many().tie();
const pLobbyID = pBase62.times(12).map((list: string[]) => list.join(''));
const pMatchConfigID = pBase62.times(14).map((list: string[]) => list.join(''));
// Lobby attributes
// Roles

const attackerRole = P.string('a').map(_ => 'attacker' as RoleSetting);
const defenderRole = P.string('d').map(_ => 'defender' as RoleSetting);
const randomRole = P.string('r').map(_ => 'random' as RoleSetting);
const pRoleSetting = P.alt(attackerRole, defenderRole, randomRole);
// Rounds

function validateRoundLength(n: number): boolean {
  // NOTE: This currently returns the wrong blocks per second for A1
  const BLOCKS_PER_SECOND = 4; // TODO: pull from some config? see getBlockTime
  const BLOCKS_PER_MINUTE = 60 / BLOCKS_PER_SECOND;
  const BLOCKS_PER_DAY = BLOCKS_PER_MINUTE * 60 * 24;
  return n >= BLOCKS_PER_MINUTE && n <= BLOCKS_PER_DAY;
}
const pRoundLength = P.digits.map(Number).chain(n => {
  if (validateRoundLength(n)) return P.succeed(n);
  else return P.fail(`Round Length must be between 1 minute and 1 day`);
});
const pNumOfRounds = P.digits.map(Number).chain(n => {
  if (n >= 3 && n <= 1000) return P.succeed(n);
  else return P.fail(`Round Number must be between 3 and 1000`);
});
// Maps
const pMaps = P.alt(
  P.string('jungle'),
  P.string('backwards'),
  P.string('crossing'),
  P.string('narrow'),
  P.string('snake'),
  P.string('straight'),
  P.string('wavy'),
  P.string('fork'),
  P.string('islands')
);
export function parseInput(s: string): ParsedSubmittedInput {
  const c = consumer.initialize(s);
  if (c.concisePrefix === 'c') return parseCreate(c);
  else if (c.concisePrefix === 'j') return parseJoin(c);
  else if (c.concisePrefix === 'cs') return parseClose(c);
  else if (c.concisePrefix === 's') return parseSubmitTurn(c);
  else if (c.concisePrefix === 'n') return parseNFT(c);
  else if (c.concisePrefix === 'z') return parseZombie(c);
  else if (c.concisePrefix === 'u') return parseUserStats(c);
  else return { input: 'invalidString' };
}
function parseCreate(c: ConciseConsumer): CreatedLobbyInput | InvalidInput {
  try {
    const matchConfigID = tryParse(c.nextValue(), pMatchConfigID);
    const creatorFaction = tryParse(c.nextValue(), pRoleSetting);
    const numOfRounds = tryParse(c.nextValue(), pNumOfRounds);
    const roundLength = tryParse(c.nextValue(), pRoundLength);
    const isHidden = tryParse(c.nextValue(), pBoolean);
    const map = tryParse(c.nextValue(), pMaps);
    const isPractice = tryParse(c.nextValue(), pBoolean);
    return {
      input: 'createdLobby',
      creatorFaction,
      numOfRounds,
      roundLength,
      isHidden,
      map,
      matchConfigID,
      isPractice,
    };
  } catch {
    return { input: 'invalidString' };
  }
}
function parseJoin(c: ConciseConsumer): JoinedLobbyInput | InvalidInput {
  try {
    const lobbyID = tryParse(c.nextValue(), pLobbyID);
    return {
      input: 'joinedLobby',
      lobbyID,
    };
  } catch {
    return { input: 'invalidString' };
  }
}
export function parseClose(c: ConciseConsumer): ClosedLobbyInput | InvalidInput {
  try {
    const lobbyID = tryParse(c.nextValue(), pLobbyID);
    return {
      input: 'closedLobby',
      lobbyID,
    };
  } catch {
    return { input: 'invalidString' };
  }
}
// Submit Turn Definitions
const pRoundNumber = P.digits.map(Number).chain(n => {
  if (n >= 1 && n <= 1000) return P.succeed(n);
  else return P.fail(`Round Number must be above 0`);
});
const pMapCoord = P.digits.map(Number);
const pStructureID = P.digits.map(Number);
const pAnacondaTower = P.string('at').map(_ => 'anacondaTower' as Structure);
const pPiranhaTower = P.string('pt').map(__ => 'piranhaTower' as Structure);
const pSlothTower = P.string('st').map(_ => 'slothTower' as Structure);
const pGorillaCrypt = P.string('gc').map(_ => 'gorillaCrypt' as Structure);
const pJaguarCrypt = P.string('jc').map(_ => 'jaguarCrypt' as Structure);
const pMacawCrypt = P.string('mc').map(_ => 'macawCrypt' as Structure);
const pStructureType = P.alt<Structure>(
  pAnacondaTower,
  pPiranhaTower,
  pSlothTower,
  pGorillaCrypt,
  pJaguarCrypt,
  pMacawCrypt
);
const buildAction = P.seqObj<BuildStructureAction>(
  P.string('b'),
  ['coordinates', pMapCoord],
  pComma,
  ['structure', pStructureType]
).map(o => {
  return { ...o, action: 'build' as const };
});
const repairAction = P.seqObj<RepairStructureAction>(P.string('r'), ['id', pStructureID]).map(o => {
  return { ...o, action: 'repair' as const };
});

const upgradeAction = P.seqObj<UpgradeStructureAction>(P.string('u'), ['id', pStructureID]).map(
  o => {
    return { ...o, action: 'upgrade' as const };
  }
);
const salvageAction = P.seqObj<SalvageStructureAction>(P.string('s'), ['id', pStructureID]).map(
  o => {
    return { ...o, action: 'salvage' as const };
  }
);

const pAction = P.alt<TurnAction>(buildAction, repairAction, upgradeAction, salvageAction);

function parseSubmitTurn(c: ConciseConsumer): SubmittedTurnInput | InvalidInput {
  try {
    const lobbyID = tryParse(c.nextValue(), pLobbyID);
    const roundNumber = tryParse(c.nextValue(), pRoundNumber);
    const actions = c.remainingValues().map(c => tryParse(c, pAction));
    return {
      input: 'submittedTurn',
      lobbyID,
      roundNumber,
      actions,
    };
  } catch {
    return { input: 'invalidString' };
  }
}
// NFT Definitions
const pNftAddress = pWallet;
const pNftID = P.digits.map(Number);
function parseNFT(c: ConciseConsumer): SetNFTInput | InvalidInput {
  try {
    const address = tryParse(c.nextValue(), pNftAddress);
    const tokenID = tryParse(c.nextValue(), pNftID);
    return {
      input: 'setNFT',
      address,
      tokenID,
    };
  } catch {
    return { input: 'invalidString' };
  }
}
function parseZombie(c: ConciseConsumer): ScheduledDataInput | InvalidInput {
  try {
    const lobbyID = tryParse(c.nextValue(), pLobbyID);
    return {
      input: 'scheduledData',
      effect: {
        type: 'zombie',
        lobbyID,
      },
    };
  } catch {
    return { input: 'invalidString' };
  }
}
const pResult = P.oneOf('wl').map(s => s as 'w' | 'l');
function parseUserStats(c: ConciseConsumer): ScheduledDataInput | InvalidInput {
  try {
    const wallet = tryParse(c.nextValue(), pWallet);
    const result = tryParse(c.nextValue(), pResult);
    return {
      input: 'scheduledData',
      effect: {
        type: 'stats',
        user: wallet,
        result,
      },
    };
  } catch {
    return { input: 'invalidString' };
  }
}
