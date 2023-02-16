import {
  BuildStructureAction,
  RepairStructureAction,
  SalvageStructureAction,
  Structure,
  TurnAction,
  UpgradeStructureAction,
} from '@tower-defense/utils';
import P from 'parsimmon';

import {
  ClosedLobbyInput,
  CreatedLobbyInput,
  JoinedLobbyInput,
  ParsedSubmittedInput,
  ScheduledDataInput,
  SetNFTInput,
  SubmittedTurnInput,
  UserStatsEffect,
  ZombieRoundEffect,
  InvalidInput,
} from './types';

// Core Definitions
const base62 = P.alt(P.letter, P.digit);
const bar = P.string('|');
const comma = P.string(',');
const bool = P.alt(P.string('T'), P.string('F'), P.string('')).map(value => {
  if (value === 'T') return true;
  return false;
});

// Wallet Definitions
const wallet = base62.many().tie();

// ID definitions

const lobbyID = base62.times(12).map((list: string[]) => list.join(''));
const asteriskLobbyID = P.seqMap(P.string('*'), lobbyID, (al1, al2) => al2);
const asteriskWallet = P.seqMap(P.string('*'), wallet, (aw1, aw2) => aw2);
const matchConfigID = base62.times(9).map((list: string[]) => list.join(''));
// TODO rob wants more characters here 14
// TODO add blockchain input for match configs

// Lobby Definitions
const attackerRole = P.string('a').map(a => 'attacker');
const defenderRole = P.string('d').map(a => 'defender');
const randomRole = P.string('r').map(a => 'random');
const roleSetting = P.alt(attackerRole, defenderRole, randomRole);
const roundLength = P.digits.map(Number).chain(n => {
  if (validateRoundLength(n)) return P.succeed(n);
  else return P.fail(`Round Length must be between 1 minute and 1 day`);
});

function validateRoundLength(n: number): boolean {
  // NOTE: This currently returns the wrong blocks per second for A1
  const BLOCKS_PER_SECOND = 4; // TODO: pull from some config? see getBlockTime
  const BLOCKS_PER_MINUTE = 60 / BLOCKS_PER_SECOND;
  const BLOCKS_PER_DAY = BLOCKS_PER_MINUTE * 60 * 24;
  return n >= BLOCKS_PER_MINUTE && n <= BLOCKS_PER_DAY;
}
const maps = P.alt(
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

// Lobby Validation Checks
// TODO how many rounds indeed?
const numOfRounds = P.digits.map(Number).chain(n => {
  if (n >= 3 && n <= 100) return P.succeed(n);
  else return P.fail(`Round Number must be between 3 and 100`);
});

// Create Lobby Definition
// TODO need to confirm the scope of MatchConfig vs other Config
// methinks numOfRounds, map type etc. is out of scope of MatchConfig
const createLobby = P.seqObj<CreatedLobbyInput>(
  P.string('c'),
  bar,
  ['matchConfigID', matchConfigID],
  bar,
  ['creatorFaction', roleSetting],
  bar,
  ['numOfRounds', numOfRounds],
  bar,
  ['roundLength', roundLength],
  bar,
  ['isHidden', bool],
  bar,
  ['map', maps],
  bar,
  ['isPractice', bool]
).map(o => {
  return { ...o, input: 'createdLobby' };
});

// Join Lobby Input Definition
const joinLobby = P.seqMap(P.string('j'), bar, asteriskLobbyID, (j, _, lobbyID) => {
  const obj: JoinedLobbyInput = {
    input: 'joinedLobby',
    lobbyID,
  };
  return obj;
});

// Close Lobby Input Definition
const closeLobby = P.seqMap(P.string('cs'), bar, asteriskLobbyID, (j, b, lobbyID) => {
  const obj: ClosedLobbyInput = {
    input: 'closedLobby',
    lobbyID,
  };
  return obj;
});

// Turn Action Helpers
// TODO max rounds??
const roundNumber = P.digits.map(Number).chain(n => {
  if (n >= 1 && n <= 1000) return P.succeed(n);
  else return P.fail(`Round Number must be above 0`);
});
const xCoord = P.digits.map(Number).chain(n => {
  if (n >= 0 && n <= 22) return P.succeed(n);
  else return P.fail(`x coordinate must be within bounds`);
});
const yCoord = P.digits.map(Number).chain(n => {
  if (n >= 0 && n <= 13) return P.succeed(n);
  else return P.fail(`y coordinate must be within bounds`);
});
const mapCoord = P.digits.map(Number);
const structureID = P.digits.map(Number);
const anacondaTower = P.string('at').map(o => 'anacondaTower' as Structure);
const piranhaTower = P.string('pt').map(o => 'piranhaTower' as Structure);
const slothTower = P.string('st').map(o => 'slothTower' as Structure);
const gorillaCrypt = P.string('gc').map(o => 'gorillaCrypt' as Structure);
const jaguarCrypt = P.string('jc').map(o => 'jaguarCrypt' as Structure);
const macawCrypt = P.string('mc').map(o => 'macawCrypt' as Structure);

const structureType = P.alt<Structure>(
  anacondaTower,
  piranhaTower,
  slothTower,
  gorillaCrypt,
  jaguarCrypt,
  macawCrypt
);
const buildAction = P.seqObj<BuildStructureAction>(
  P.string('b'),
  comma,
  ['coordinates', mapCoord],
  comma,
  ['structure', structureType],
  bar
).map(o => {
  return { ...o, action: 'build'};
});
const repairAction = P.seqObj<RepairStructureAction>(
  P.string('r'),
  comma,
  ['id', structureID],
  bar
).map(o => {
  return { ...o, action: 'repair'};
});

const upgradeAction = P.seqObj<UpgradeStructureAction>(
  P.string('u'),
  comma,
  ['id', structureID],
  bar
).map(o => {
  return { ...o, action: 'upgrade'};
});
const salvageAction = P.seqObj<SalvageStructureAction>(
  P.string('s'),
  comma,
  ['id', structureID],
  bar
).map(o => {
  return { ...o, action: 'salvage'};
});
const turnAction = P.alt(buildAction, repairAction, upgradeAction, salvageAction);
const turnActions = turnAction.many();

// Submitted Turn Input Definition
const submitTurn = P.seqObj<SubmittedTurnInput>(
  P.string('s'),
  bar,
  ['lobbyID', asteriskLobbyID],
  bar,
  ['roundNumber', roundNumber],
  bar,
  ['actions', turnActions]
).map(o => {
  // all actions have a round attribute, but passing it to each one in the concise encoding would be redundant.
  // so we map it from the round number at the head of the input
  const actions = o.actions.map(a => {
    return {...a, round: o.roundNumber}
  })
  return { ...o, actions, input: 'submittedTurn' };
});

// export function isInvalid(input: ParsedSubmittedInput): input is InvalidInput {
//   return (input as InvalidInput).error !== undefined;
// }
// NFT Helpers

const nftAddress = wallet;
const nftID = P.digits;
// Set NFT Input Definition
const setNFT = P.seqObj<SetNFTInput>(P.string('n'), bar, ['address', nftAddress], bar, [
  'tokenID',
  nftID,
]).map(o => {
  return { ...o, input: 'setNFT' };
});

// Zombie Round Input Definition
const zombieEffect = P.seqObj<ZombieRoundEffect>(P.string('z'), bar, [
  'lobbyID',
  asteriskLobbyID,
]).map<ScheduledDataInput>(o => {
  return { input: 'scheduledData', effect: { ...o, type: 'zombie' } };
});

// Update User Stats Input Definition
const statsEffect = P.seqObj<UserStatsEffect>(P.string('u'), bar, ['user', asteriskWallet], bar, [
  'result',
  P.oneOf('wtl'),
]).map<ScheduledDataInput>(o => {
  return { input: 'scheduledData', effect: { ...o, type: 'stats' } };
});

const parser: P.Parser<ParsedSubmittedInput> = P.alt(
  createLobby,
  joinLobby,
  closeLobby,
  submitTurn,
  setNFT,
  zombieEffect,
  statsEffect
);
function parse(s: string): ParsedSubmittedInput {
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
//utils/src/parser
export default parse;
