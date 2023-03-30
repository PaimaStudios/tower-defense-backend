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
} from '@tower-defense/utils';
import { GameENV } from '@tower-defense/utils';

import {
  ClosedLobbyInput,
  CreatedLobbyInput,
  InvalidInput,
  JoinedLobbyInput,
  ParsedSubmittedInput,
  RoleSetting,
  ScheduledDataInput,
  SetNFTInput,
  SubmittedTurnInput,
} from './types';

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
  // TODO: maybe utilize getBlockTime
  // NOTE: This currently uses the wrong block_time for A1 deployment
  const BLOCKS_PER_MINUTE = 60 / GameENV.BLOCK_TIME;
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
