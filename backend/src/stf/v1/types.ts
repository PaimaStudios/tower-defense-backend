import { TurnAction } from "@tower-defense/utils";

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
  actions: TurnAction[]
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
  result: 'w' | 't' | 'l';
}

export type WalletAddress = string;
export type Map = string;

export type GameInput = 'createdLobby' | 'joinedLobby' | 'submittedTurn';