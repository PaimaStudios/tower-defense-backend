import type { MapName, ResultConcise, RoleSetting, TurnAction } from '@tower-defense/utils';
import type { WalletAddress } from 'paima-engine/paima-utils';

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
export interface CreatedLobbyInput {
  input: 'createdLobby';
  creatorFaction: RoleSetting;
  numOfRounds: number;
  roundLength: number;
  map: MapName;
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

export function isZombieRound(input: ScheduledDataInput): input is ZombieRound {
  return (input as ZombieRound).effect === 'zombie';
}

export function isUserStats(input: ScheduledDataInput): input is UserStats {
  return (input as UserStats).effect === 'stats';
}
