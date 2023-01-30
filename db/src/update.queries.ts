/** Types generated for queries found in "src/update.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type lobby_status = 'active' | 'closed' | 'finished' | 'open';

export type role_setting = 'attacker' | 'defender' | 'random';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'RemoveScheduledData' parameters type */
export interface IRemoveScheduledDataParams {
  block_height: number;
  input_data: string;
}

/** 'RemoveScheduledData' return type */
export type IRemoveScheduledDataResult = void;

/** 'RemoveScheduledData' query type */
export interface IRemoveScheduledDataQuery {
  params: IRemoveScheduledDataParams;
  result: IRemoveScheduledDataResult;
}

const removeScheduledDataIR: any = {"usedParamSet":{"block_height":true,"input_data":true},"params":[{"name":"block_height","required":true,"transform":{"type":"scalar"},"locs":[{"a":48,"b":61}]},{"name":"input_data","required":true,"transform":{"type":"scalar"},"locs":[{"a":80,"b":91}]}],"statement":"DELETE FROM scheduled_data\nWHERE block_height = :block_height!\nAND input_data = :input_data!             "};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM scheduled_data
 * WHERE block_height = :block_height!
 * AND input_data = :input_data!             
 * ```
 */
export const removeScheduledData = new PreparedQuery<IRemoveScheduledDataParams,IRemoveScheduledDataResult>(removeScheduledDataIR);


/** 'AddWin' parameters type */
export interface IAddWinParams {
  wallet: string | null | void;
}

/** 'AddWin' return type */
export type IAddWinResult = void;

/** 'AddWin' query type */
export interface IAddWinQuery {
  params: IAddWinParams;
  result: IAddWinResult;
}

const addWinIR: any = {"usedParamSet":{"wallet":true},"params":[{"name":"wallet","required":false,"transform":{"type":"scalar"},"locs":[{"a":60,"b":66}]}],"statement":"UPDATE global_user_state\nSET\nwins = wins + 1\nWHERE wallet = :wallet"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE global_user_state
 * SET
 * wins = wins + 1
 * WHERE wallet = :wallet
 * ```
 */
export const addWin = new PreparedQuery<IAddWinParams,IAddWinResult>(addWinIR);


/** 'AddLoss' parameters type */
export interface IAddLossParams {
  wallet: string | null | void;
}

/** 'AddLoss' return type */
export type IAddLossResult = void;

/** 'AddLoss' query type */
export interface IAddLossQuery {
  params: IAddLossParams;
  result: IAddLossResult;
}

const addLossIR: any = {"usedParamSet":{"wallet":true},"params":[{"name":"wallet","required":false,"transform":{"type":"scalar"},"locs":[{"a":64,"b":70}]}],"statement":"UPDATE global_user_state\nSET\nlosses = losses + 1\nWHERE wallet = :wallet"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE global_user_state
 * SET
 * losses = losses + 1
 * WHERE wallet = :wallet
 * ```
 */
export const addLoss = new PreparedQuery<IAddLossParams,IAddLossResult>(addLossIR);


/** 'AddTie' parameters type */
export interface IAddTieParams {
  wallet: string | null | void;
}

/** 'AddTie' return type */
export type IAddTieResult = void;

/** 'AddTie' query type */
export interface IAddTieQuery {
  params: IAddTieParams;
  result: IAddTieResult;
}

const addTieIR: any = {"usedParamSet":{"wallet":true},"params":[{"name":"wallet","required":false,"transform":{"type":"scalar"},"locs":[{"a":60,"b":66}]}],"statement":"UPDATE global_user_state\nSET\nties = ties + 1\nWHERE wallet = :wallet              "};

/**
 * Query generated from SQL:
 * ```
 * UPDATE global_user_state
 * SET
 * ties = ties + 1
 * WHERE wallet = :wallet              
 * ```
 */
export const addTie = new PreparedQuery<IAddTieParams,IAddTieResult>(addTieIR);


/** 'ExecuteRound' parameters type */
export interface IExecuteRoundParams {
  execution_block_height: number;
  lobby_id: string;
  round: number;
}

/** 'ExecuteRound' return type */
export type IExecuteRoundResult = void;

/** 'ExecuteRound' query type */
export interface IExecuteRoundQuery {
  params: IExecuteRoundParams;
  result: IExecuteRoundResult;
}

const executeRoundIR: any = {"usedParamSet":{"execution_block_height":true,"lobby_id":true,"round":true},"params":[{"name":"execution_block_height","required":true,"transform":{"type":"scalar"},"locs":[{"a":43,"b":66}]},{"name":"lobby_id","required":true,"transform":{"type":"scalar"},"locs":[{"a":92,"b":101}]},{"name":"round","required":true,"transform":{"type":"scalar"},"locs":[{"a":135,"b":141}]}],"statement":"UPDATE rounds\nSET execution_block_height = :execution_block_height!\nWHERE rounds.lobby_id = :lobby_id!\nAND rounds.round_within_match = :round!                              "};

/**
 * Query generated from SQL:
 * ```
 * UPDATE rounds
 * SET execution_block_height = :execution_block_height!
 * WHERE rounds.lobby_id = :lobby_id!
 * AND rounds.round_within_match = :round!                              
 * ```
 */
export const executeRound = new PreparedQuery<IExecuteRoundParams,IExecuteRoundResult>(executeRoundIR);


/** 'StartMatch' parameters type */
export interface IStartMatchParams {
  current_match_state: Json;
  lobby_id: string;
  player_two: string;
}

/** 'StartMatch' return type */
export interface IStartMatchResult {
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

/** 'StartMatch' query type */
export interface IStartMatchQuery {
  params: IStartMatchParams;
  result: IStartMatchResult;
}

const startMatchIR: any = {"usedParamSet":{"player_two":true,"current_match_state":true,"lobby_id":true},"params":[{"name":"player_two","required":true,"transform":{"type":"scalar"},"locs":[{"a":58,"b":69}]},{"name":"current_match_state","required":true,"transform":{"type":"scalar"},"locs":[{"a":94,"b":114}]},{"name":"lobby_id","required":true,"transform":{"type":"scalar"},"locs":[{"a":133,"b":142}]}],"statement":"UPDATE lobbies\nSET  \nlobby_state = 'active',\nplayer_two = :player_two!,\ncurrent_match_state = :current_match_state!\nWHERE lobby_id = :lobby_id!\nAND player_two IS NULL\nRETURNING *"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE lobbies
 * SET  
 * lobby_state = 'active',
 * player_two = :player_two!,
 * current_match_state = :current_match_state!
 * WHERE lobby_id = :lobby_id!
 * AND player_two IS NULL
 * RETURNING *
 * ```
 */
export const startMatch = new PreparedQuery<IStartMatchParams,IStartMatchResult>(startMatchIR);


/** 'UpdateCurrentMatchState' parameters type */
export interface IUpdateCurrentMatchStateParams {
  current_match_state: Json;
  lobby_id: string | null | void;
}

/** 'UpdateCurrentMatchState' return type */
export type IUpdateCurrentMatchStateResult = void;

/** 'UpdateCurrentMatchState' query type */
export interface IUpdateCurrentMatchStateQuery {
  params: IUpdateCurrentMatchStateParams;
  result: IUpdateCurrentMatchStateResult;
}

const updateCurrentMatchStateIR: any = {"usedParamSet":{"current_match_state":true,"lobby_id":true},"params":[{"name":"current_match_state","required":true,"transform":{"type":"scalar"},"locs":[{"a":41,"b":61}]},{"name":"lobby_id","required":false,"transform":{"type":"scalar"},"locs":[{"a":80,"b":88}]}],"statement":"UPDATE lobbies\nSET current_match_state = :current_match_state!\nWHERE lobby_id = :lobby_id"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE lobbies
 * SET current_match_state = :current_match_state!
 * WHERE lobby_id = :lobby_id
 * ```
 */
export const updateCurrentMatchState = new PreparedQuery<IUpdateCurrentMatchStateParams,IUpdateCurrentMatchStateResult>(updateCurrentMatchStateIR);


/** 'UpdateCurrentRound' parameters type */
export interface IUpdateCurrentRoundParams {
  lobby_id: string;
  round: number;
}

/** 'UpdateCurrentRound' return type */
export type IUpdateCurrentRoundResult = void;

/** 'UpdateCurrentRound' query type */
export interface IUpdateCurrentRoundQuery {
  params: IUpdateCurrentRoundParams;
  result: IUpdateCurrentRoundResult;
}

const updateCurrentRoundIR: any = {"usedParamSet":{"round":true,"lobby_id":true},"params":[{"name":"round","required":true,"transform":{"type":"scalar"},"locs":[{"a":35,"b":41}]},{"name":"lobby_id","required":true,"transform":{"type":"scalar"},"locs":[{"a":60,"b":69}]}],"statement":"UPDATE lobbies\nSET current_round = :round!\nWHERE lobby_id = :lobby_id!"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE lobbies
 * SET current_round = :round!
 * WHERE lobby_id = :lobby_id!
 * ```
 */
export const updateCurrentRound = new PreparedQuery<IUpdateCurrentRoundParams,IUpdateCurrentRoundResult>(updateCurrentRoundIR);


/** 'CloseLobby' parameters type */
export interface ICloseLobbyParams {
  lobby_id: string;
}

/** 'CloseLobby' return type */
export type ICloseLobbyResult = void;

/** 'CloseLobby' query type */
export interface ICloseLobbyQuery {
  params: ICloseLobbyParams;
  result: ICloseLobbyResult;
}

const closeLobbyIR: any = {"usedParamSet":{"lobby_id":true},"params":[{"name":"lobby_id","required":true,"transform":{"type":"scalar"},"locs":[{"a":60,"b":69}]}],"statement":"UPDATE lobbies\nSET  lobby_state = 'closed'\nWHERE lobby_id = :lobby_id!\nAND player_two IS NULL"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE lobbies
 * SET  lobby_state = 'closed'
 * WHERE lobby_id = :lobby_id!
 * AND player_two IS NULL
 * ```
 */
export const closeLobby = new PreparedQuery<ICloseLobbyParams,ICloseLobbyResult>(closeLobbyIR);


/** 'EndMatch' parameters type */
export interface IEndMatchParams {
  lobby_id: string;
}

/** 'EndMatch' return type */
export type IEndMatchResult = void;

/** 'EndMatch' query type */
export interface IEndMatchQuery {
  params: IEndMatchParams;
  result: IEndMatchResult;
}

const endMatchIR: any = {"usedParamSet":{"lobby_id":true},"params":[{"name":"lobby_id","required":true,"transform":{"type":"scalar"},"locs":[{"a":62,"b":71}]}],"statement":"UPDATE lobbies\nSET  lobby_state = 'finished'\nWHERE lobby_id = :lobby_id!"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE lobbies
 * SET  lobby_state = 'finished'
 * WHERE lobby_id = :lobby_id!
 * ```
 */
export const endMatch = new PreparedQuery<IEndMatchParams,IEndMatchResult>(endMatchIR);


