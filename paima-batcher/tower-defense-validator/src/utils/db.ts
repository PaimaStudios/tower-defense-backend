/** Types generated for queries found in "src/select.sql" */

export type lobby_status = 'active' | 'closed' | 'finished' | 'open';

export type match_result = 'loss' | 'win';

export type move_type = 'build' | 'repair' | 'salvage' | 'upgrade';

export type role_setting = 'attacker' | 'defender' | 'random';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'GetBlockHeight' return type */
export interface IGetBlockHeightResult {
  block_height: number;
  done: boolean;
  seed: string;
}

/** 'GetRoundData' return type */
export interface IGetRoundDataResult {
  execution_block_height: number | null;
  id: number;
  lobby_id: string;
  match_state: Json;
  round_within_match: number;
  starting_block_height: number;
}

/** 'GetLobbyById' return type */
export interface IGetLobbyByIdResult {
  config_id: string | null;
  created_at: Date;
  creation_block_height: number;
  creator_faction: role_setting;
  current_match_state: Json;
  current_round: number;
  hidden: boolean;
  lobby_creator: string;
  lobby_id: string;
  lobby_state: lobby_status;
  map: string;
  num_of_rounds: number;
  player_two: string | null;
  practice: boolean;
  round_length: number;
}
