/** Types generated for queries found in "src/insert.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type lobby_status = 'active' | 'closed' | 'finished' | 'open';

export type move_type = 'build' | 'destroy' | 'repair' | 'upgrade';

export type role_setting = 'attacker' | 'defender' | 'random';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'NewScheduledData' parameters type */
export interface INewScheduledDataParams {
  block_height: number;
  input_data: string;
}

/** 'NewScheduledData' return type */
export type INewScheduledDataResult = void;

/** 'NewScheduledData' query type */
export interface INewScheduledDataQuery {
  params: INewScheduledDataParams;
  result: INewScheduledDataResult;
}

const newScheduledDataIR: any = {"usedParamSet":{"block_height":true,"input_data":true},"params":[{"name":"block_height","required":true,"transform":{"type":"scalar"},"locs":[{"a":61,"b":74}]},{"name":"input_data","required":true,"transform":{"type":"scalar"},"locs":[{"a":77,"b":88}]}],"statement":"INSERT INTO scheduled_data(block_height, input_data)\nVALUES (:block_height!, :input_data!)              "};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO scheduled_data(block_height, input_data)
 * VALUES (:block_height!, :input_data!)              
 * ```
 */
export const newScheduledData = new PreparedQuery<INewScheduledDataParams,INewScheduledDataResult>(newScheduledDataIR);


/** 'NewRound' parameters type */
export interface INewRoundParams {
  execution_block_height: number | null | void;
  lobby_id: string;
  round_within_match: number;
  starting_block_height: number;
}

/** 'NewRound' return type */
export interface INewRoundResult {
  execution_block_height: number | null;
  id: number;
  lobby_id: string;
  round_within_match: number;
  starting_block_height: number;
}

/** 'NewRound' query type */
export interface INewRoundQuery {
  params: INewRoundParams;
  result: INewRoundResult;
}

const newRoundIR: any = {"usedParamSet":{"lobby_id":true,"round_within_match":true,"starting_block_height":true,"execution_block_height":true},"params":[{"name":"lobby_id","required":true,"transform":{"type":"scalar"},"locs":[{"a":104,"b":113}]},{"name":"round_within_match","required":true,"transform":{"type":"scalar"},"locs":[{"a":116,"b":135}]},{"name":"starting_block_height","required":true,"transform":{"type":"scalar"},"locs":[{"a":138,"b":160}]},{"name":"execution_block_height","required":false,"transform":{"type":"scalar"},"locs":[{"a":163,"b":185}]}],"statement":"INSERT INTO rounds(lobby_id, round_within_match, starting_block_height, execution_block_height)\nVALUES (:lobby_id!, :round_within_match!, :starting_block_height!, :execution_block_height)\nRETURNING *             "};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO rounds(lobby_id, round_within_match, starting_block_height, execution_block_height)
 * VALUES (:lobby_id!, :round_within_match!, :starting_block_height!, :execution_block_height)
 * RETURNING *             
 * ```
 */
export const newRound = new PreparedQuery<INewRoundParams,INewRoundResult>(newRoundIR);


/** 'NewStats' parameters type */
export interface INewStatsParams {
  stats: {
    wallet: string,
    wins: number,
    losses: number,
    ties: number
  };
}

/** 'NewStats' return type */
export type INewStatsResult = void;

/** 'NewStats' query type */
export interface INewStatsQuery {
  params: INewStatsParams;
  result: INewStatsResult;
}

const newStatsIR: any = {"usedParamSet":{"stats":true},"params":[{"name":"stats","required":false,"transform":{"type":"pick_tuple","keys":[{"name":"wallet","required":true},{"name":"wins","required":true},{"name":"losses","required":true},{"name":"ties","required":true}]},"locs":[{"a":37,"b":42}]}],"statement":"INSERT INTO global_user_state\nVALUES :stats\nON CONFLICT (wallet)\nDO NOTHING"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO global_user_state
 * VALUES :stats
 * ON CONFLICT (wallet)
 * DO NOTHING
 * ```
 */
export const newStats = new PreparedQuery<INewStatsParams,INewStatsResult>(newStatsIR);


/** 'UpdateStats' parameters type */
export interface IUpdateStatsParams {
  stats: {
    wallet: string,
    wins: number,
    losses: number,
    ties: number
  };
}

/** 'UpdateStats' return type */
export type IUpdateStatsResult = void;

/** 'UpdateStats' query type */
export interface IUpdateStatsQuery {
  params: IUpdateStatsParams;
  result: IUpdateStatsResult;
}

const updateStatsIR: any = {"usedParamSet":{"stats":true},"params":[{"name":"stats","required":false,"transform":{"type":"pick_tuple","keys":[{"name":"wallet","required":true},{"name":"wins","required":true},{"name":"losses","required":true},{"name":"ties","required":true}]},"locs":[{"a":37,"b":42}]}],"statement":"INSERT INTO global_user_state\nVALUES :stats\nON CONFLICT (wallet)\nDO UPDATE SET\nwins = EXCLUDED.wins,\nlosses = EXCLUDED.losses,\nties = EXCLUDED.ties            "};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO global_user_state
 * VALUES :stats
 * ON CONFLICT (wallet)
 * DO UPDATE SET
 * wins = EXCLUDED.wins,
 * losses = EXCLUDED.losses,
 * ties = EXCLUDED.ties            
 * ```
 */
export const updateStats = new PreparedQuery<IUpdateStatsParams,IUpdateStatsResult>(updateStatsIR);


/** 'NewNft' parameters type */
export interface INewNftParams {
  address: string;
  block_height: number;
  timestamp: Date;
  token_id: number;
  wallet: string;
}

/** 'NewNft' return type */
export type INewNftResult = void;

/** 'NewNft' query type */
export interface INewNftQuery {
  params: INewNftParams;
  result: INewNftResult;
}

const newNftIR: any = {"usedParamSet":{"wallet":true,"block_height":true,"address":true,"token_id":true,"timestamp":true},"params":[{"name":"wallet","required":true,"transform":{"type":"scalar"},"locs":[{"a":76,"b":83}]},{"name":"block_height","required":true,"transform":{"type":"scalar"},"locs":[{"a":86,"b":99}]},{"name":"address","required":true,"transform":{"type":"scalar"},"locs":[{"a":102,"b":110}]},{"name":"token_id","required":true,"transform":{"type":"scalar"},"locs":[{"a":113,"b":122}]},{"name":"timestamp","required":true,"transform":{"type":"scalar"},"locs":[{"a":125,"b":135}]}],"statement":"INSERT INTO nfts(wallet, block_height, address, token_id, timestamp)\nVALUES(:wallet!, :block_height!, :address!, :token_id!, :timestamp!)\nON CONFLICT (wallet, block_height)\nDO UPDATE SET\naddress = EXCLUDED.address,\ntoken_id = EXCLUDED.token_id,\ntimestamp = EXCLUDED.timestamp               "};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO nfts(wallet, block_height, address, token_id, timestamp)
 * VALUES(:wallet!, :block_height!, :address!, :token_id!, :timestamp!)
 * ON CONFLICT (wallet, block_height)
 * DO UPDATE SET
 * address = EXCLUDED.address,
 * token_id = EXCLUDED.token_id,
 * timestamp = EXCLUDED.timestamp               
 * ```
 */
export const newNft = new PreparedQuery<INewNftParams,INewNftResult>(newNftIR);


/** 'CreateConfig' parameters type */
export interface ICreateConfigParams {
  content: string;
  id: string;
}

/** 'CreateConfig' return type */
export type ICreateConfigResult = void;

/** 'CreateConfig' query type */
export interface ICreateConfigQuery {
  params: ICreateConfigParams;
  result: ICreateConfigResult;
}

const createConfigIR: any = {"usedParamSet":{"id":true,"content":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":40,"b":43}]},{"name":"content","required":true,"transform":{"type":"scalar"},"locs":[{"a":46,"b":54}]}],"statement":"INSERT INTO configs(id, content)\nVALUES(:id!, :content!)               "};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO configs(id, content)
 * VALUES(:id!, :content!)               
 * ```
 */
export const createConfig = new PreparedQuery<ICreateConfigParams,ICreateConfigResult>(createConfigIR);


/** 'CreateLobby' parameters type */
export interface ICreateLobbyParams {
  config_id: string;
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
  player_two: string | null | void;
  practice: boolean;
  round_length: number;
}

/** 'CreateLobby' return type */
export type ICreateLobbyResult = void;

/** 'CreateLobby' query type */
export interface ICreateLobbyQuery {
  params: ICreateLobbyParams;
  result: ICreateLobbyResult;
}

const createLobbyIR: any = {"usedParamSet":{"lobby_id":true,"lobby_creator":true,"creator_faction":true,"num_of_rounds":true,"round_length":true,"current_round":true,"lobby_state":true,"creation_block_height":true,"map":true,"config_id":true,"created_at":true,"hidden":true,"practice":true,"current_match_state":true,"player_two":true},"params":[{"name":"lobby_id","required":true,"transform":{"type":"scalar"},"locs":[{"a":262,"b":271}]},{"name":"lobby_creator","required":true,"transform":{"type":"scalar"},"locs":[{"a":276,"b":290}]},{"name":"creator_faction","required":true,"transform":{"type":"scalar"},"locs":[{"a":295,"b":311}]},{"name":"num_of_rounds","required":true,"transform":{"type":"scalar"},"locs":[{"a":316,"b":330}]},{"name":"round_length","required":true,"transform":{"type":"scalar"},"locs":[{"a":335,"b":348}]},{"name":"current_round","required":true,"transform":{"type":"scalar"},"locs":[{"a":353,"b":367}]},{"name":"lobby_state","required":true,"transform":{"type":"scalar"},"locs":[{"a":372,"b":384}]},{"name":"creation_block_height","required":true,"transform":{"type":"scalar"},"locs":[{"a":389,"b":411}]},{"name":"map","required":true,"transform":{"type":"scalar"},"locs":[{"a":416,"b":420}]},{"name":"config_id","required":true,"transform":{"type":"scalar"},"locs":[{"a":425,"b":435}]},{"name":"created_at","required":true,"transform":{"type":"scalar"},"locs":[{"a":440,"b":451}]},{"name":"hidden","required":true,"transform":{"type":"scalar"},"locs":[{"a":456,"b":463}]},{"name":"practice","required":true,"transform":{"type":"scalar"},"locs":[{"a":468,"b":477}]},{"name":"current_match_state","required":true,"transform":{"type":"scalar"},"locs":[{"a":482,"b":502}]},{"name":"player_two","required":false,"transform":{"type":"scalar"},"locs":[{"a":507,"b":517}]}],"statement":"INSERT INTO lobbies(\n  lobby_id,\n  lobby_creator,\n  creator_faction,\n  num_of_rounds,\n  round_length,\n  current_round,\n  lobby_state,\n  creation_block_height,\n  map,\n  config_id,\n  created_at,\n  hidden,\n  practice,\n  current_match_state,\n  player_two)\nVALUES(\n  :lobby_id!,\n  :lobby_creator!,\n  :creator_faction!,\n  :num_of_rounds!,\n  :round_length!,\n  :current_round!,\n  :lobby_state!,\n  :creation_block_height!,\n  :map!,\n  :config_id!,\n  :created_at!,\n  :hidden!,\n  :practice!,\n  :current_match_state!,\n  :player_two)             "};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO lobbies(
 *   lobby_id,
 *   lobby_creator,
 *   creator_faction,
 *   num_of_rounds,
 *   round_length,
 *   current_round,
 *   lobby_state,
 *   creation_block_height,
 *   map,
 *   config_id,
 *   created_at,
 *   hidden,
 *   practice,
 *   current_match_state,
 *   player_two)
 * VALUES(
 *   :lobby_id!,
 *   :lobby_creator!,
 *   :creator_faction!,
 *   :num_of_rounds!,
 *   :round_length!,
 *   :current_round!,
 *   :lobby_state!,
 *   :creation_block_height!,
 *   :map!,
 *   :config_id!,
 *   :created_at!,
 *   :hidden!,
 *   :practice!,
 *   :current_match_state!,
 *   :player_two)             
 * ```
 */
export const createLobby = new PreparedQuery<ICreateLobbyParams,ICreateLobbyResult>(createLobbyIR);


/** 'NewMatchMove' parameters type */
export interface INewMatchMoveParams {
  new_move: {
    lobby_id: string,
    wallet: string,
    round: number,
    move_type: move_type,
    move_target: string
  };
}

/** 'NewMatchMove' return type */
export type INewMatchMoveResult = void;

/** 'NewMatchMove' query type */
export interface INewMatchMoveQuery {
  params: INewMatchMoveParams;
  result: INewMatchMoveResult;
}

const newMatchMoveIR: any = {"usedParamSet":{"new_move":true},"params":[{"name":"new_move","required":false,"transform":{"type":"pick_tuple","keys":[{"name":"lobby_id","required":true},{"name":"wallet","required":true},{"name":"round","required":true},{"name":"move_type","required":true},{"name":"move_target","required":true}]},"locs":[{"a":80,"b":88}]}],"statement":"INSERT INTO match_moves(lobby_id, wallet, round, move_type, move_target)\nVALUES :new_move"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO match_moves(lobby_id, wallet, round, move_type, move_target)
 * VALUES :new_move
 * ```
 */
export const newMatchMove = new PreparedQuery<INewMatchMoveParams,INewMatchMoveResult>(newMatchMoveIR);


