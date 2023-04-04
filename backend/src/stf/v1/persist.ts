import type { SQLUpdate } from 'paima-engine/paima-db';
import type { SetNFTInput, SubmittedTurnInput } from './types.js';
import type Prando from 'paima-engine/paima-prando';
import type { WalletAddress } from 'paima-engine/paima-utils';
import { generateRandomMoves } from '@tower-defense/game-logic';
import type { MatchConfig, MatchState, TurnAction } from '@tower-defense/utils';
import { PRACTICE_BOT_ADDRESS } from '@tower-defense/utils';
import type {
  IGetLobbyByIdResult,
  IGetRoundDataResult,
  INewMatchMoveParams,
  INewNftParams,
} from '@tower-defense/db';
import { newMatchMove, newNft } from '@tower-defense/db';
import { executeRound } from './transition.js';

// this file deals with receiving blockchain data input and outputting SQL updates (imported from pgTyped output of our SQL files)
// PGTyped SQL updates are a tuple of the function calling the database and the params sent to it.

// There are generic user inputs: CreateLobby, CloseLobby, JoinLobby, SetNFT. + TD specific ones
// We deal with each on its own `persist` function.
// User Metadata is created first thing inside the persistLobbyCreation and persistLobbyJoin functions.

export function persistMoveSubmission(
  blockHeight: number,
  user: WalletAddress,
  inputData: SubmittedTurnInput,
  lobbyState: IGetLobbyByIdResult,
  matchConfig: MatchConfig,
  roundData: IGetRoundDataResult,
  randomnessGenerator: Prando
): SQLUpdate[] {
  // Rounds in Tower Defense work differently. Only one player submits moves per round.
  // First turn for each player is just for building.
  // After that, each round triggers a battle phase.
  // i.e. Defender submits moves -> Battle phase
  // then Attacker submits moves -> Annother battle phase.
  // Now we check if both users have sent their moves, if so, we execute the round.
  // We'll assume the moves are valid at this stage, invalid moves shouldn't have got this far.
  // Save the moves to the database;
  const movesTuples = inputData.actions.map(a => persistMove(lobbyState.lobby_id, user, a));
  // Execute the round after moves come in. Pass the moves in database params format to the round executor.
  const roundExecutionTuples = executeRound(
    blockHeight,
    lobbyState,
    matchConfig,
    inputData.actions,
    roundData,
    randomnessGenerator
  );
  const practiceTuples = lobbyState.practice
    ? practiceRound(
        blockHeight,
        { ...lobbyState, current_round: lobbyState.current_round + 1 },
        matchConfig,
        roundData, // match state here should have been mutated by the previous round execution...
        randomnessGenerator
      )
    : [];
  return [...movesTuples, ...roundExecutionTuples, ...practiceTuples];
}

export function practiceRound(
  blockHeight: number,
  lobbyState: IGetLobbyByIdResult,
  matchConfig: MatchConfig,
  roundData: IGetRoundDataResult,
  randomnessGenerator: Prando
): SQLUpdate[] {
  const matchState = roundData.match_state as unknown as MatchState;
  const user = PRACTICE_BOT_ADDRESS;
  const faction = user === matchState.defender ? 'defender' : 'attacker';
  const moves = generateRandomMoves(
    matchConfig,
    matchState,
    faction,
    roundData.round_within_match + 1
  );
  const movesTuples = moves.map(a => persistMove(lobbyState.lobby_id, user, a));
  const roundExecutionTuples = executeRound(
    blockHeight,
    lobbyState,
    matchConfig,
    moves,
    { ...roundData, round_within_match: roundData.round_within_match + 1 },
    randomnessGenerator
  );
  return [...movesTuples, ...roundExecutionTuples];
}

// Persist submitted move to database
function persistMove(matchId: string, user: WalletAddress, a: TurnAction): SQLUpdate {
  const move_target = a.action === 'build' ? `${a.structure}--${a.coordinates}` : `${a.id}`;
  const mmParams: INewMatchMoveParams = {
    new_move: {
      lobby_id: matchId,
      wallet: user,
      round: a.round,
      move_type: a.action,
      move_target,
    },
  };
  return [newMatchMove, mmParams];
}

// Persists the submitted data from a `Set NFT` game input
export function persistNFT(
  user: WalletAddress,
  blockHeight: number,
  inputData: SetNFTInput
): SQLUpdate {
  const params: INewNftParams = {
    wallet: user,
    block_height: blockHeight,
    address: inputData.address,
    token_id: inputData.tokenID,
    timestamp: new Date(),
  };
  return [newNft, params];
}
