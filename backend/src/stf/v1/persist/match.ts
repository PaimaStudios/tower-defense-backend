import type {
  IExecuteRoundParams,
  IGetLobbyByIdResult,
  IGetRoundDataResult,
  INewRoundParams,
  IUpdateCurrentMatchStateParams,
} from '@tower-defense/db';
import { newRound } from '@tower-defense/db';
import { updateCurrentMatchState } from '@tower-defense/db';
import { executeRound } from '@tower-defense/db';
import type { SQLUpdate } from 'paima-engine/paima-db';
import { deleteZombieRound, scheduleZombieRound } from './zombie';
import type { MatchState } from '@tower-defense/utils';

// This function inserts a new empty round in the database.
// We schedule rounds here for future automatic execution as zombie rounds in this function.
export function persistNewRound(
  lobbyID: string,
  round: number,
  roundLength: number,
  matchState: MatchState,
  blockHeight: number
): SQLUpdate[] {
  const nrParams: INewRoundParams = {
    lobby_id: lobbyID,
    round_within_match: round + 1,
    starting_block_height: blockHeight,
    execution_block_height: null,
    match_state: matchState as any,
  };
  const newRoundTuple: SQLUpdate = [newRound, nrParams];
  // Scheduling of the zombie round execution in the future
  const zombie_block_height = blockHeight + roundLength;
  const zombieRoundUpdate: SQLUpdate = scheduleZombieRound(lobbyID, zombie_block_height);
  return [newRoundTuple, zombieRoundUpdate];
}

// Persist an executed round (and delete scheduled zombie round input)
export function persistExecutedRound(
  roundData: IGetRoundDataResult,
  lobby: IGetLobbyByIdResult,
  blockHeight: number
): SQLUpdate[] {
  // We close the round by updating it with the execution blockHeight
  const exParams: IExecuteRoundParams = {
    lobby_id: lobby.lobby_id,
    round: lobby.current_round,
    execution_block_height: blockHeight,
  };
  const executedRoundTuple: SQLUpdate = [executeRound, exParams];

  // We remove the scheduled zombie round input
  const block_height = roundData.starting_block_height + lobby.round_length;
  return [executedRoundTuple, deleteZombieRound(lobby.lobby_id, block_height)];
}

// Update Lobby state with the updated board
export function persistUpdateMatchState(lobbyId: string, newMatchState: MatchState): SQLUpdate {
  const params: IUpdateCurrentMatchStateParams = {
    lobby_id: lobbyId,
    current_match_state: newMatchState as any,
  };
  return [updateCurrentMatchState, params];
}
