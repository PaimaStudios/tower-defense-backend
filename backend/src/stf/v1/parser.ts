import type { ParserRecord } from '@paima/concise';
import { PaimaParser } from '@paima/concise';
import P from 'parsimmon';
import type {
  BuildStructureAction,
  RepairStructureAction,
  ResultConcise,
  RoleSettingConcise,
  SalvageStructureAction,
  StructureType,
  TurnAction,
  UpgradeStructureAction,
} from '@tower-defense/utils';
import { configParser, maps } from '@tower-defense/utils';

import type {
  ClosedLobbyInput,
  CreatedLobbyInput,
  JoinedLobbyInput,
  ParsedSubmittedInput,
  SetNFTInput,
  SubmittedTurnInput,
  UserStats,
  ZombieRound,
  WipeOldLobbies,
  RegisteredConfigInput,
} from './types';
import { conciseFactionMap } from '@tower-defense/game-logic';
import type { ConciseConsumer, ConciseValue } from '@paima/concise';
import { consumer } from '@paima/concise';

// submittedMoves left out for now intentionally
const myGrammar = `
createdLobby         = c|matchConfigID|creatorFaction|numOfRounds|roundLength|isHidden?|map|isPractice?
joinedLobby          = j|*lobbyID
closedLobby          = cs|*lobbyID
setNFT               = n|address|tokenID
zombieScheduledData  = z|*lobbyID
userScheduledData    = u|*user|result
wipeDBScheduledData  = w|days
`;

const roleSettings: RoleSettingConcise[] = ['a', 'd', 'r'];
const createdLobby: ParserRecord<CreatedLobbyInput> = {
  matchConfigID: PaimaParser.NCharsParser(14, 14),
  creatorFaction: PaimaParser.EnumParser(
    roleSettings,
    value => conciseFactionMap[value as RoleSettingConcise]
  ),
  numOfRounds: PaimaParser.NumberParser(3, 1000),
  roundLength: PaimaParser.DefaultRoundLength(parseInt(process.env.BLOCK_TIME || '4', 0)),
  isHidden: PaimaParser.TrueFalseParser(false),
  map: PaimaParser.EnumParser(maps),
  isPractice: PaimaParser.TrueFalseParser(false),
};
const joinedLobby: ParserRecord<JoinedLobbyInput> = {
  lobbyID: PaimaParser.NCharsParser(12, 12),
};
const closedLobby: ParserRecord<ClosedLobbyInput> = {
  lobbyID: PaimaParser.NCharsParser(12, 12),
};
const setNFT: ParserRecord<SetNFTInput> = {
  address: PaimaParser.WalletAddress(), // not a user's walletAddress but same possible characters
  tokenID: PaimaParser.NumberParser(),
};
const zombieScheduledData: ParserRecord<ZombieRound> = {
  renameCommand: 'scheduledData',
  effect: 'zombie',
  lobbyID: PaimaParser.NCharsParser(12, 12),
};
const results: ResultConcise[] = ['w', 'l'];
const userScheduledData: ParserRecord<UserStats> = {
  renameCommand: 'scheduledData',
  effect: 'stats',
  user: PaimaParser.WalletAddress(),
  result: PaimaParser.EnumParser(results),
};
const wipeDBScheduledData: ParserRecord<WipeOldLobbies> = {
  renameCommand: 'scheduledData',
  effect: 'wipeOldLobbies',
  days: PaimaParser.NumberParser(1, 100),
};

const parserCommands: Record<string, ParserRecord<ParsedSubmittedInput>> = {
  createdLobby,
  joinedLobby,
  closedLobby,
  setNFT,
  zombieScheduledData,
  userScheduledData,
  wipeDBScheduledData,
};

// Special parser for move submition
// Submit Turn Definitions
const pBase62 = P.alt(P.letter, P.digit);
const pLobbyID = pBase62.times(12).map((list: string[]) => list.join(''));
const pRoundNumber = P.digits.map(Number).chain(n => {
  if (n >= 1 && n <= 1000) return P.succeed(n);
  else return P.fail(`Round Number must be above 0`);
});
const pMapCoord = P.digits.map(Number);
const pStructureID = P.digits.map(Number);
const pAnacondaTower = P.string('at').map<StructureType>(_ => 'anacondaTower');
const pPiranhaTower = P.string('pt').map<StructureType>(__ => 'piranhaTower');
const pSlothTower = P.string('st').map<StructureType>(_ => 'slothTower');
const pGorillaCrypt = P.string('gc').map<StructureType>(_ => 'gorillaCrypt');
const pJaguarCrypt = P.string('jc').map<StructureType>(_ => 'jaguarCrypt');
const pMacawCrypt = P.string('mc').map<StructureType>(_ => 'macawCrypt');
const pStructureType = P.alt<StructureType>(
  pAnacondaTower,
  pPiranhaTower,
  pSlothTower,
  pGorillaCrypt,
  pJaguarCrypt,
  pMacawCrypt
);

// Submit move actions
const buildAction = P.seqObj<BuildStructureAction>(
  P.string('b'),
  ['coordinates', pMapCoord],
  P.string(','),
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

function tryParse<T>(c: ConciseValue | null, parser: P.Parser<T>): T {
  if (!c) throw 'parsing error';
  return parser.tryParse(c.value);
}

function parseSubmitTurn(c: ConciseConsumer): SubmittedTurnInput {
  const lobbyID = tryParse(c.nextValue(), pLobbyID);
  const roundNumber = tryParse(c.nextValue(), pRoundNumber);
  const actions = c.remainingValues().map(c => tryParse(c, pAction));
  return {
    input: 'submittedTurn',
    lobbyID,
    roundNumber,
    actions,
  };
}

function parseRegisterConfig(c: ConciseConsumer): RegisteredConfigInput {
  const version = tryParse(c.nextValue(), pRoundNumber);
  const content = tryParse(c.nextValue(), P.all);
  console.log(content, 'config to register');
  const config = configParser(content);
  if ('error' in config) throw config.error;
  return {
    input: 'registeredConfig',
    version,
    content,
  };
}

const myParser = new PaimaParser(myGrammar, parserCommands, { debug: process.env.NODE_ENV === 'development' });

function parse(input: string): ParsedSubmittedInput {
  try {
    const cConsumer = consumer.initialize(input);
    // custom parser for submit moves since paima parser isn't that generic (yet)
    if (cConsumer.prefix() === 's') {
      return parseSubmitTurn(cConsumer);
    } else if (cConsumer.prefix() === 'r') {
      return parseRegisterConfig(cConsumer);
    } else {
      const parsed = myParser.start(input);
      return { input: parsed.command, ...parsed.args } as any;
    }
  } catch (e) {
    console.log(e, 'Parsing error');
    return { input: 'invalidString' };
  }
}

export default parse;
