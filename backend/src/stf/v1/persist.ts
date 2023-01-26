import { CreatedLobbyInput, JoinedLobbyInput, WalletAddress, SetNFTInput } from '../../types.js';
import Prando from 'paima-engine/paima-prando';
import { RoundExecutor } from 'paima-engine/paima-executors';
import processTick from '@tower-defense/game-logic';
import { SQLUpdate } from 'paima-engine/paima-utils';
import { LobbyStatus, PlayersState, PRACTICE_BOT_ADDRESS } from '@tower-defense/utils';

// this file deals with receiving blockchain data input and outputting SQL updates (imported from pgTyped output of our SQL files)
// PGTyped SQL updates are a tuple of the function calling the database and the params sent to it.

// There are generic user inputs: CreateLobby, CloseLobby, JoinLobby, SetNFT. + TD specific ones
// We deal with each on its own `persist` function.
// User Metadata is created first thing inside the persistLobbyCreation and persistLobbyJoin functions.

// TODO: remove after DB exists:
type IGetLobbyByIdResult = any;
type IGetUserStatesByRoundResult = any;
type IGetRoundDataResult = any;
type IGetRoundMovesResult = any;
type IGetUserStatsResult = any;
type IGetCachedMovesResult = any;
// TODO: remove after DB exists:

// Generate blank/empty user stats
function blankStats(wallet: string): SQLUpdate {
  return null as any as SQLUpdate;
}

// Persist creation of a lobby
export function persistLobbyCreation(
  user: WalletAddress,
  blockHeight: number,
  inputData: CreatedLobbyInput,
  randomnessGenerator: Prando
): SQLUpdate[] {
  return [];
}

// Persist joining a lobby
export function persistLobbyJoin(
  blockHeight: number,
  user: WalletAddress,
  inputData: JoinedLobbyInput,
  lobbyState: IGetLobbyByIdResult
): SQLUpdate[] {
  return [];
}

// Convert lobby from `open` to `close`
export function persistCloseLobby(
  user: WalletAddress,
  lobby: IGetLobbyByIdResult
): SQLUpdate | null {
  return null;
}

// Convert lobby from `open` to `active`
function activateLobby(
  user: WalletAddress,
  lobbyState: IGetLobbyByIdResult,
  blockHeight: number,
  inputData: JoinedLobbyInput
): SQLUpdate[] {
  return [];
}

// Create initial match state, used when a player joins a lobby to init the match.
function createInitialMatchState(
  user: WalletAddress,
  lobbyState: IGetLobbyByIdResult,
  blockHeight: number
): SQLUpdate[] {
  return [];
}

// This function inserts a new empty round in the database.
// We schedule rounds here for future automatic execution as zombie rounds in this function.
function incrementRound(
  lobbyID: string,
  round: number,
  round_length: number,
  blockHeight: number
): SQLUpdate[] {
  return [];
}

export function persistMoveSubmission(
  blockHeight: number,
  user: WalletAddress,
  inputData: any,
  lobbyState: IGetLobbyByIdResult,
  states: IGetUserStatesByRoundResult[],
  cachedMoves: IGetCachedMovesResult[],
  roundData: IGetRoundDataResult,
  randomnessGenerator: Prando
): SQLUpdate[] {
  return [];
}

// Calls the 'round executor' and produces the necessary SQL updates which result
function execute(
  blockHeight: number,
  lobbyState: IGetLobbyByIdResult,
  moves: IGetRoundMovesResult[],
  roundData: IGetRoundDataResult,
  randomnessGenerator: Prando
): SQLUpdate[] {
  return [];
}

export function persistStatsUpdate(
  user: WalletAddress,
  result: ConciseResult,
  stats: IGetUserStatsResult
): SQLUpdate {
  return null as any as SQLUpdate;
}

type ConciseResult = 'w' | 't' | 'l';
type ExpandedResult = 'win' | 'tie' | 'loss';
function expandResult(c: ConciseResult): ExpandedResult {
  if (c === 'w') return 'win';
  else if (c === 't') return 'tie';
  else return 'loss';
}

// Finalizes the match and updates user statistics according to final score of the match
function finalizeMatch(
  blockHeight: number,
  lobbyID: string,
  isPractice: boolean,
  states: PlayersState
): SQLUpdate[] {
  return [];
}

// Compute which of the two players is the winner (or if it's a tie, null)
function computeWinner(states: PlayersState): string | null {
  if (states.user1.health > states.user2.health) return states.user1.wallet;
  else if (states.user1.health < states.user2.health) return states.user2.wallet;
  else return null;
}

// Persist submitted move to database
function persistMove(matchId: string, round: number, user: WalletAddress, move: any): SQLUpdate {
  return null as any as SQLUpdate;
}

// This function executes 'zombie rounds', rounds where both users haven't submitted input, but which have reached the specified timeout time per round.
// We just call the 'execute' function passing the unexecuted moves from the database, if any.
export function executeZombieRound(
  blockHeight: number,
  lobbyState: IGetLobbyByIdResult,
  moves: IGetRoundMovesResult[],
  roundData: IGetRoundDataResult,
  randomnessGenerator: Prando
) {
  console.log(
    `Executing zombie round (#${lobbyState.current_round}) for lobby ${lobbyState.lobby_id}`
  );
  return execute(blockHeight, lobbyState, moves, roundData, randomnessGenerator);
}

// Persists the submitted data from a `Set NFT` game input
export function persistNFT(
  user: WalletAddress,
  blockHeight: number,
  inputData: SetNFTInput
): SQLUpdate {
  return null as any as SQLUpdate;
}
