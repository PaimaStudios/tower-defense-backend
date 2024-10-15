import type {
  BotDifficulty,
  MapName,
  ResultConcise,
  RoleSetting,
  TurnAction,
} from '@tower-defense/utils';
import type { WalletAddress } from '@paima/chain-types';

export type ParsedSubmittedInput =
  | CreatedLobbyInput
  | JoinedLobbyInput
  | ClosedLobbyInput
  | SubmittedTurnInput
  | ScheduledDataInput
  | SetNFTInput
  | RegisteredConfigInput
  | InvalidInput;

export interface InvalidInput {
  input: 'invalidString';
}
export interface CreatedLobbyInput {
  input: 'createdLobby';
  creatorFaction: RoleSetting;
  numOfRounds: number;
  roundLength: number;
  map: MapName;
  matchConfigID: string; // same format as lobby ID, 12char base 62
  isHidden: boolean;
  isPractice: boolean;
  // adds random moves for AFK players when time runs out
  hasAutoplay: boolean;
  botDifficulty: BotDifficulty;
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
}

export interface ZombieRound extends ScheduledDataInput {
  effect: 'zombie';
  lobbyID: string;
}

export interface UserStats extends ScheduledDataInput {
  effect: 'stats';
  user: WalletAddress;
  result: ResultConcise;
}
export interface WipeOldLobbies extends ScheduledDataInput {
  effect: 'wipeOldLobbies';
  days: number;
}

export interface RegisteredConfigInput {
  input: 'registeredConfig';
  version: number;
  content: string;
}

export function isZombieRound(input: ScheduledDataInput): input is ZombieRound {
  return (input as ZombieRound).effect === 'zombie';
}

export function isUserStats(input: ScheduledDataInput): input is UserStats {
  return (input as UserStats).effect === 'stats';
}

export function isWipeOldLobbies(input: ScheduledDataInput): input is WipeOldLobbies {
  return (input as WipeOldLobbies).effect === 'wipeOldLobbies';
}
