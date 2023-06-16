/** Types generated for queries found in "src/insert.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type lobby_status = 'active' | 'closed' | 'finished' | 'open';

export type match_result = 'loss' | 'win';

export type move_type = 'build' | 'repair' | 'salvage' | 'upgrade';

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
  match_state: Json;
  round_within_match: number;
  starting_block_height: number;
}

/** 'NewRound' return type */
export interface INewRoundResult {
  execution_block_height: number | null;
  id: number;
  lobby_id: string;
  match_state: Json;
  round_within_match: number;
  starting_block_height: number;
}

/** 'NewRound' query type */
export interface INewRoundQuery {
  params: INewRoundParams;
  result: INewRoundResult;
}

const newRoundIR: any = {"usedParamSet":{"lobby_id":true,"round_within_match":true,"match_state":true,"starting_block_height":true,"execution_block_height":true},"params":[{"name":"lobby_id","required":true,"transform":{"type":"scalar"},"locs":[{"a":117,"b":126}]},{"name":"round_within_match","required":true,"transform":{"type":"scalar"},"locs":[{"a":129,"b":148}]},{"name":"match_state","required":true,"transform":{"type":"scalar"},"locs":[{"a":151,"b":163}]},{"name":"starting_block_height","required":true,"transform":{"type":"scalar"},"locs":[{"a":166,"b":188}]},{"name":"execution_block_height","required":false,"transform":{"type":"scalar"},"locs":[{"a":191,"b":213}]}],"statement":"INSERT INTO rounds(lobby_id, round_within_match, match_state, starting_block_height, execution_block_height)\nVALUES (:lobby_id!, :round_within_match!, :match_state!, :starting_block_height!, :execution_block_height)\nRETURNING *             "};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO rounds(lobby_id, round_within_match, match_state, starting_block_height, execution_block_height)
 * VALUES (:lobby_id!, :round_within_match!, :match_state!, :starting_block_height!, :execution_block_height)
 * RETURNING *             
 * ```
 */
export const newRound = new PreparedQuery<INewRoundParams,INewRoundResult>(newRoundIR);


/** 'NewStats' parameters type */
export interface INewStatsParams {
  stats: {
    wallet: string,
    wins: number,
    losses: number
  };
}

/** 'NewStats' return type */
export type INewStatsResult = void;

/** 'NewStats' query type */
export interface INewStatsQuery {
  params: INewStatsParams;
  result: INewStatsResult;
}

const newStatsIR: any = {"usedParamSet":{"stats":true},"params":[{"name":"stats","required":false,"transform":{"type":"pick_tuple","keys":[{"name":"wallet","required":true},{"name":"wins","required":true},{"name":"losses","required":true}]},"locs":[{"a":37,"b":42}]}],"statement":"INSERT INTO global_user_state\nVALUES :stats\nON CONFLICT (wallet)\nDO NOTHING"};

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
    losses: number
  };
}

/** 'UpdateStats' return type */
export type IUpdateStatsResult = void;

/** 'UpdateStats' query type */
export interface IUpdateStatsQuery {
  params: IUpdateStatsParams;
  result: IUpdateStatsResult;
}

const updateStatsIR: any = {"usedParamSet":{"stats":true},"params":[{"name":"stats","required":false,"transform":{"type":"pick_tuple","keys":[{"name":"wallet","required":true},{"name":"wins","required":true},{"name":"losses","required":true}]},"locs":[{"a":37,"b":42}]}],"statement":"INSERT INTO global_user_state\nVALUES :stats\nON CONFLICT (wallet)\nDO UPDATE SET\nwins = EXCLUDED.wins,\nlosses = EXCLUDED.losses            "};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO global_user_state
 * VALUES :stats
 * ON CONFLICT (wallet)
 * DO UPDATE SET
 * wins = EXCLUDED.wins,
 * losses = EXCLUDED.losses            
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
  creator: string;
  id: string;
  version: number;
}

/** 'CreateConfig' return type */
export type ICreateConfigResult = void;

/** 'CreateConfig' query type */
export interface ICreateConfigQuery {
  params: ICreateConfigParams;
  result: ICreateConfigResult;
}

const createConfigIR: any = {"usedParamSet":{"id":true,"creator":true,"version":true,"content":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":58,"b":61}]},{"name":"creator","required":true,"transform":{"type":"scalar"},"locs":[{"a":64,"b":72}]},{"name":"version","required":true,"transform":{"type":"scalar"},"locs":[{"a":75,"b":83}]},{"name":"content","required":true,"transform":{"type":"scalar"},"locs":[{"a":86,"b":94}]}],"statement":"INSERT INTO configs(id, creator, version, content)\nVALUES(:id!, :creator!, :version!, :content!)\nON CONFLICT(id)\nDO NOTHING               "};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO configs(id, creator, version, content)
 * VALUES(:id!, :creator!, :version!, :content!)
 * ON CONFLICT(id)
 * DO NOTHING               
 * ```
 */
export const createConfig = new PreparedQuery<ICreateConfigParams,ICreateConfigResult>(createConfigIR);


/** 'CreateLobby' parameters type */
export interface ICreateLobbyParams {
  autoplay: boolean;
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

const createLobbyIR: any = {"usedParamSet":{"lobby_id":true,"lobby_creator":true,"creator_faction":true,"num_of_rounds":true,"round_length":true,"current_round":true,"lobby_state":true,"creation_block_height":true,"map":true,"config_id":true,"created_at":true,"hidden":true,"practice":true,"autoplay":true,"current_match_state":true,"player_two":true},"params":[{"name":"lobby_id","required":true,"transform":{"type":"scalar"},"locs":[{"a":274,"b":283}]},{"name":"lobby_creator","required":true,"transform":{"type":"scalar"},"locs":[{"a":288,"b":302}]},{"name":"creator_faction","required":true,"transform":{"type":"scalar"},"locs":[{"a":307,"b":323}]},{"name":"num_of_rounds","required":true,"transform":{"type":"scalar"},"locs":[{"a":328,"b":342}]},{"name":"round_length","required":true,"transform":{"type":"scalar"},"locs":[{"a":347,"b":360}]},{"name":"current_round","required":true,"transform":{"type":"scalar"},"locs":[{"a":365,"b":379}]},{"name":"lobby_state","required":true,"transform":{"type":"scalar"},"locs":[{"a":384,"b":396}]},{"name":"creation_block_height","required":true,"transform":{"type":"scalar"},"locs":[{"a":401,"b":423}]},{"name":"map","required":true,"transform":{"type":"scalar"},"locs":[{"a":428,"b":432}]},{"name":"config_id","required":true,"transform":{"type":"scalar"},"locs":[{"a":437,"b":447}]},{"name":"created_at","required":true,"transform":{"type":"scalar"},"locs":[{"a":452,"b":463}]},{"name":"hidden","required":true,"transform":{"type":"scalar"},"locs":[{"a":468,"b":475}]},{"name":"practice","required":true,"transform":{"type":"scalar"},"locs":[{"a":480,"b":489}]},{"name":"autoplay","required":true,"transform":{"type":"scalar"},"locs":[{"a":494,"b":503}]},{"name":"current_match_state","required":true,"transform":{"type":"scalar"},"locs":[{"a":508,"b":528}]},{"name":"player_two","required":false,"transform":{"type":"scalar"},"locs":[{"a":533,"b":543}]}],"statement":"INSERT INTO lobbies(\n  lobby_id,\n  lobby_creator,\n  creator_faction,\n  num_of_rounds,\n  round_length,\n  current_round,\n  lobby_state,\n  creation_block_height,\n  map,\n  config_id,\n  created_at,\n  hidden,\n  practice,\n  autoplay,\n  current_match_state,\n  player_two)\nVALUES(\n  :lobby_id!,\n  :lobby_creator!,\n  :creator_faction!,\n  :num_of_rounds!,\n  :round_length!,\n  :current_round!,\n  :lobby_state!,\n  :creation_block_height!,\n  :map!,\n  :config_id!,\n  :created_at!,\n  :hidden!,\n  :practice!,\n  :autoplay!,\n  :current_match_state!,\n  :player_two)             "};

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
 *   autoplay,
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
 *   :autoplay!,
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

const newMatchMoveIR: any = {"usedParamSet":{"new_move":true},"params":[{"name":"new_move","required":false,"transform":{"type":"pick_tuple","keys":[{"name":"lobby_id","required":true},{"name":"wallet","required":true},{"name":"round","required":true},{"name":"move_type","required":true},{"name":"move_target","required":true}]},"locs":[{"a":80,"b":88}]}],"statement":"INSERT INTO match_moves(lobby_id, wallet, round, move_type, move_target)\nVALUES :new_move                       "};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO match_moves(lobby_id, wallet, round, move_type, move_target)
 * VALUES :new_move                       
 * ```
 */
export const newMatchMove = new PreparedQuery<INewMatchMoveParams,INewMatchMoveResult>(newMatchMoveIR);


/** 'NewFinalState' parameters type */
export interface INewFinalStateParams {
  final_state: {
    lobby_id: string,
    player_one_wallet: string,
    player_one_result: match_result,
    player_one_gold: number,
    player_two_wallet: string,
    player_two_result: match_result,
    player_two_gold: number,
    final_health: number
  };
}

/** 'NewFinalState' return type */
export type INewFinalStateResult = void;

/** 'NewFinalState' query type */
export interface INewFinalStateQuery {
  params: INewFinalStateParams;
  result: INewFinalStateResult;
}

const newFinalStateIR: any = {"usedParamSet":{"final_state":true},"params":[{"name":"final_state","required":false,"transform":{"type":"pick_tuple","keys":[{"name":"lobby_id","required":true},{"name":"player_one_wallet","required":true},{"name":"player_one_result","required":true},{"name":"player_one_gold","required":true},{"name":"player_two_wallet","required":true},{"name":"player_two_result","required":true},{"name":"player_two_gold","required":true},{"name":"final_health","required":true}]},"locs":[{"a":171,"b":182}]}],"statement":"INSERT INTO final_match_state(lobby_id, player_one_wallet, player_one_result, player_one_gold, player_two_wallet, player_two_result, player_two_gold, final_health)\nVALUES :final_state"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO final_match_state(lobby_id, player_one_wallet, player_one_result, player_one_gold, player_two_wallet, player_two_result, player_two_gold, final_health)
 * VALUES :final_state
 * ```
 */
export const newFinalState = new PreparedQuery<INewFinalStateParams,INewFinalStateResult>(newFinalStateIR);


