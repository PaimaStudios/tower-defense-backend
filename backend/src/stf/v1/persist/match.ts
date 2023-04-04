import type {
  IExecuteRoundParams,
  IGetLobbyByIdResult,
  IGetRoundDataResult,
  IUpdateCurrentMatchStateParams,
} from '@tower-defense/db';
import { updateCurrentMatchState } from '@tower-defense/db';
import { executeRound } from '@tower-defense/db';
import type { SQLUpdate } from 'paima-engine/paima-db';
import { deleteZombieRound } from './zombie';
import type { MatchState } from '@tower-defense/utils';

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
