/** Types generated for queries found in "src/select.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type lobby_status = 'active' | 'closed' | 'finished' | 'open';

export type move_type = 'build' | 'repair' | 'salvage' | 'upgrade';

export type role_setting = 'attacker' | 'defender' | 'random';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'GetBlockHeight' parameters type */
export interface IGetBlockHeightParams {
  block_height: number | null | void;
}

/** 'GetBlockHeight' return type */
export interface IGetBlockHeightResult {
  block_height: number;
  done: boolean;
  seed: string;
}

/** 'GetBlockHeight' query type */
export interface IGetBlockHeightQuery {
  params: IGetBlockHeightParams;
  result: IGetBlockHeightResult;
}

const getBlockHeightIR: any = {"usedParamSet":{"block_height":true},"params":[{"name":"block_height","required":false,"transform":{"type":"scalar"},"locs":[{"a":50,"b":62}]}],"statement":"SELECT * FROM block_heights \nWHERE block_height = :block_height"};

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM block_heights 
 * WHERE block_height = :block_height
 * ```
 */
export const getBlockHeight = new PreparedQuery<IGetBlockHeightParams,IGetBlockHeightResult>(getBlockHeightIR);


/** 'GetLatestBlockHeight' parameters type */
export type IGetLatestBlockHeightParams = void;

/** 'GetLatestBlockHeight' return type */
export interface IGetLatestBlockHeightResult {
  block_height: number;
  done: boolean;
  seed: string;
}

/** 'GetLatestBlockHeight' query type */
export interface IGetLatestBlockHeightQuery {
  params: IGetLatestBlockHeightParams;
  result: IGetLatestBlockHeightResult;
}

const getLatestBlockHeightIR: any = {"usedParamSet":{},"params":[],"statement":"SELECT * FROM block_heights \nORDER BY block_height DESC\nLIMIT 1"};

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM block_heights 
 * ORDER BY block_height DESC
 * LIMIT 1
 * ```
 */
export const getLatestBlockHeight = new PreparedQuery<IGetLatestBlockHeightParams,IGetLatestBlockHeightResult>(getLatestBlockHeightIR);


/** 'GetLatestProcessedBlockHeight' parameters type */
export type IGetLatestProcessedBlockHeightParams = void;

/** 'GetLatestProcessedBlockHeight' return type */
export interface IGetLatestProcessedBlockHeightResult {
  block_height: number;
  done: boolean;
  seed: string;
}

/** 'GetLatestProcessedBlockHeight' query type */
export interface IGetLatestProcessedBlockHeightQuery {
  params: IGetLatestProcessedBlockHeightParams;
  result: IGetLatestProcessedBlockHeightResult;
}

const getLatestProcessedBlockHeightIR: any = {"usedParamSet":{},"params":[],"statement":"SELECT * FROM block_heights \nWHERE done IS TRUE\nORDER BY block_height DESC\nLIMIT 1"};

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM block_heights 
 * WHERE done IS TRUE
 * ORDER BY block_height DESC
 * LIMIT 1
 * ```
 */
export const getLatestProcessedBlockHeight = new PreparedQuery<IGetLatestProcessedBlockHeightParams,IGetLatestProcessedBlockHeightResult>(getLatestProcessedBlockHeightIR);


/** 'GetMatchSeeds' parameters type */
export interface IGetMatchSeedsParams {
  lobby_id: string | null | void;
}

/** 'GetMatchSeeds' return type */
export interface IGetMatchSeedsResult {
  block_height: number;
  done: boolean;
  execution_block_height: number | null;
  id: number;
  lobby_id: string;
  round_within_match: number;
  seed: string;
  starting_block_height: number;
}

/** 'GetMatchSeeds' query type */
export interface IGetMatchSeedsQuery {
  params: IGetMatchSeedsParams;
  result: IGetMatchSeedsResult;
}

const getMatchSeedsIR: any = {"usedParamSet":{"lobby_id":true},"params":[{"name":"lobby_id","required":false,"transform":{"type":"scalar"},"locs":[{"a":132,"b":140}]}],"statement":"SELECT * FROM rounds\nINNER JOIN block_heights\nON block_heights.block_height = rounds.execution_block_height\nWHERE rounds.lobby_id = :lobby_id                      "};

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM rounds
 * INNER JOIN block_heights
 * ON block_heights.block_height = rounds.execution_block_height
 * WHERE rounds.lobby_id = :lobby_id                      
 * ```
 */
export const getMatchSeeds = new PreparedQuery<IGetMatchSeedsParams,IGetMatchSeedsResult>(getMatchSeedsIR);


/** 'GetScheduledDataByBlockHeight' parameters type */
export interface IGetScheduledDataByBlockHeightParams {
  block_height: number;
}

/** 'GetScheduledDataByBlockHeight' return type */
export interface IGetScheduledDataByBlockHeightResult {
  block_height: number;
  id: number;
  input_data: string;
}

/** 'GetScheduledDataByBlockHeight' query type */
export interface IGetScheduledDataByBlockHeightQuery {
  params: IGetScheduledDataByBlockHeightParams;
  result: IGetScheduledDataByBlockHeightResult;
}

const getScheduledDataByBlockHeightIR: any = {"usedParamSet":{"block_height":true},"params":[{"name":"block_height","required":true,"transform":{"type":"scalar"},"locs":[{"a":50,"b":63}]}],"statement":"SELECT * from scheduled_data\nWHERE block_height = :block_height!\nORDER BY id ASC              "};

/**
 * Query generated from SQL:
 * ```
 * SELECT * from scheduled_data
 * WHERE block_height = :block_height!
 * ORDER BY id ASC              
 * ```
 */
export const getScheduledDataByBlockHeight = new PreparedQuery<IGetScheduledDataByBlockHeightParams,IGetScheduledDataByBlockHeightResult>(getScheduledDataByBlockHeightIR);


/** 'GetRoundData' parameters type */
export interface IGetRoundDataParams {
  lobby_id: string;
  round_number: number | null | void;
}

/** 'GetRoundData' return type */
export interface IGetRoundDataResult {
  execution_block_height: number | null;
  id: number;
  lobby_id: string;
  round_within_match: number;
  starting_block_height: number;
}

/** 'GetRoundData' query type */
export interface IGetRoundDataQuery {
  params: IGetRoundDataParams;
  result: IGetRoundDataResult;
}

const getRoundDataIR: any = {"usedParamSet":{"lobby_id":true,"round_number":true},"params":[{"name":"lobby_id","required":true,"transform":{"type":"scalar"},"locs":[{"a":38,"b":47}]},{"name":"round_number","required":false,"transform":{"type":"scalar"},"locs":[{"a":74,"b":86}]}],"statement":"SELECT * FROM rounds\nWHERE lobby_id = :lobby_id!\nAND round_within_match = :round_number"};

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM rounds
 * WHERE lobby_id = :lobby_id!
 * AND round_within_match = :round_number
 * ```
 */
export const getRoundData = new PreparedQuery<IGetRoundDataParams,IGetRoundDataResult>(getRoundDataIR);


/** 'GetLatestRoundByMatchId' parameters type */
export interface IGetLatestRoundByMatchIdParams {
  lobby_id: string;
}

/** 'GetLatestRoundByMatchId' return type */
export interface IGetLatestRoundByMatchIdResult {
  final_round: number;
  id: number;
  lobby_creator: string;
  lobby_id: string;
  player_two: string | null;
  round_within_match: number;
  starting_block_height: number;
}

/** 'GetLatestRoundByMatchId' query type */
export interface IGetLatestRoundByMatchIdQuery {
  params: IGetLatestRoundByMatchIdParams;
  result: IGetLatestRoundByMatchIdResult;
}

const getLatestRoundByMatchIdIR: any = {"usedParamSet":{"lobby_id":true},"params":[{"name":"lobby_id","required":true,"transform":{"type":"scalar"},"locs":[{"a":376,"b":385}]}],"statement":"SELECT\nrounds.id,\nrounds.lobby_id, \nrounds.round_within_match,\nlobbies.num_of_rounds AS final_round,\nlobbies.lobby_creator,\nlobbies.player_two,\nblock_heights.block_height AS starting_block_height\nFROM rounds\nINNER JOIN block_heights \nON rounds.starting_block_height = block_heights.block_height\nINNER JOIN lobbies\nON lobbies.lobby_id = rounds.lobby_id\nWHERE rounds.lobby_id = :lobby_id!\nORDER BY rounds.id DESC\nLIMIT 1"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 * rounds.id,
 * rounds.lobby_id, 
 * rounds.round_within_match,
 * lobbies.num_of_rounds AS final_round,
 * lobbies.lobby_creator,
 * lobbies.player_two,
 * block_heights.block_height AS starting_block_height
 * FROM rounds
 * INNER JOIN block_heights 
 * ON rounds.starting_block_height = block_heights.block_height
 * INNER JOIN lobbies
 * ON lobbies.lobby_id = rounds.lobby_id
 * WHERE rounds.lobby_id = :lobby_id!
 * ORDER BY rounds.id DESC
 * LIMIT 1
 * ```
 */
export const getLatestRoundByMatchId = new PreparedQuery<IGetLatestRoundByMatchIdParams,IGetLatestRoundByMatchIdResult>(getLatestRoundByMatchIdIR);


/** 'GetAllUnexecutedRounds' parameters type */
export type IGetAllUnexecutedRoundsParams = void;

/** 'GetAllUnexecutedRounds' return type */
export interface IGetAllUnexecutedRoundsResult {
  final_round: number;
  id: number;
  lobby_id: string;
  round_within_match: number;
  starting_block_height: number;
}

/** 'GetAllUnexecutedRounds' query type */
export interface IGetAllUnexecutedRoundsQuery {
  params: IGetAllUnexecutedRoundsParams;
  result: IGetAllUnexecutedRoundsResult;
}

const getAllUnexecutedRoundsIR: any = {"usedParamSet":{},"params":[],"statement":"SELECT \nrounds.id,\nrounds.lobby_id, \nrounds.round_within_match,\nlobbies.num_of_rounds AS final_round,\nblock_heights.block_height AS starting_block_height\nFROM rounds\nINNER JOIN block_heights \nON rounds.starting_block_height = block_heights.block_height\nINNER JOIN lobbies\nON lobbies.lobby_id = rounds.lobby_id\nWHERE execution_block_height IS NULL             "};

/**
 * Query generated from SQL:
 * ```
 * SELECT 
 * rounds.id,
 * rounds.lobby_id, 
 * rounds.round_within_match,
 * lobbies.num_of_rounds AS final_round,
 * block_heights.block_height AS starting_block_height
 * FROM rounds
 * INNER JOIN block_heights 
 * ON rounds.starting_block_height = block_heights.block_height
 * INNER JOIN lobbies
 * ON lobbies.lobby_id = rounds.lobby_id
 * WHERE execution_block_height IS NULL             
 * ```
 */
export const getAllUnexecutedRounds = new PreparedQuery<IGetAllUnexecutedRoundsParams,IGetAllUnexecutedRoundsResult>(getAllUnexecutedRoundsIR);


/** 'GetUserStats' parameters type */
export interface IGetUserStatsParams {
  wallet: string | null | void;
}

/** 'GetUserStats' return type */
export interface IGetUserStatsResult {
  losses: number;
  wallet: string;
  wins: number;
}

/** 'GetUserStats' query type */
export interface IGetUserStatsQuery {
  params: IGetUserStatsParams;
  result: IGetUserStatsResult;
}

const getUserStatsIR: any = {"usedParamSet":{"wallet":true},"params":[{"name":"wallet","required":false,"transform":{"type":"scalar"},"locs":[{"a":47,"b":53}]}],"statement":"SELECT * FROM global_user_state\nWHERE wallet = :wallet"};

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM global_user_state
 * WHERE wallet = :wallet
 * ```
 */
export const getUserStats = new PreparedQuery<IGetUserStatsParams,IGetUserStatsResult>(getUserStatsIR);


/** 'GetMatchUserStats' parameters type */
export interface IGetMatchUserStatsParams {
  wallet1: string | null | void;
}

/** 'GetMatchUserStats' return type */
export interface IGetMatchUserStatsResult {
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
  losses: number;
  map: string;
  num_of_rounds: number;
  player_two: string | null;
  practice: boolean;
  round_length: number;
  wallet: string;
  wins: number;
}

/** 'GetMatchUserStats' query type */
export interface IGetMatchUserStatsQuery {
  params: IGetMatchUserStatsParams;
  result: IGetMatchUserStatsResult;
}

const getMatchUserStatsIR: any = {"usedParamSet":{"wallet1":true},"params":[{"name":"wallet1","required":false,"transform":{"type":"scalar"},"locs":[{"a":185,"b":192}]}],"statement":"SELECT * FROM global_user_state\nINNER JOIN lobbies\nON lobbies.lobby_creator = global_user_state.wallet\nOR lobbies.player_two = global_user_state.wallet\nWHERE global_user_state.wallet = :wallet1"};

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM global_user_state
 * INNER JOIN lobbies
 * ON lobbies.lobby_creator = global_user_state.wallet
 * OR lobbies.player_two = global_user_state.wallet
 * WHERE global_user_state.wallet = :wallet1
 * ```
 */
export const getMatchUserStats = new PreparedQuery<IGetMatchUserStatsParams,IGetMatchUserStatsResult>(getMatchUserStatsIR);


/** 'GetBothUserStats' parameters type */
export interface IGetBothUserStatsParams {
  wallet: string | null | void;
  wallet2: string | null | void;
}

/** 'GetBothUserStats' return type */
export interface IGetBothUserStatsResult {
  losses: number;
  wallet: string;
  wins: number;
}

/** 'GetBothUserStats' query type */
export interface IGetBothUserStatsQuery {
  params: IGetBothUserStatsParams;
  result: IGetBothUserStatsResult;
}

const getBothUserStatsIR: any = {"usedParamSet":{"wallet":true,"wallet2":true},"params":[{"name":"wallet","required":false,"transform":{"type":"scalar"},"locs":[{"a":102,"b":108}]},{"name":"wallet2","required":false,"transform":{"type":"scalar"},"locs":[{"a":140,"b":147}]}],"statement":"SELECT global_user_state.wallet, wins, losses\nFROM global_user_state\nWHERE global_user_state.wallet = :wallet\nOR global_user_state.wallet = :wallet2            "};

/**
 * Query generated from SQL:
 * ```
 * SELECT global_user_state.wallet, wins, losses
 * FROM global_user_state
 * WHERE global_user_state.wallet = :wallet
 * OR global_user_state.wallet = :wallet2            
 * ```
 */
export const getBothUserStats = new PreparedQuery<IGetBothUserStatsParams,IGetBothUserStatsResult>(getBothUserStatsIR);


/** 'GetUserNfTs' parameters type */
export interface IGetUserNfTsParams {
  wallet: string | null | void;
}

/** 'GetUserNfTs' return type */
export interface IGetUserNfTsResult {
  address: string;
  block_height: number;
  timestamp: Date | null;
  token_id: number;
  wallet: string;
}

/** 'GetUserNfTs' query type */
export interface IGetUserNfTsQuery {
  params: IGetUserNfTsParams;
  result: IGetUserNfTsResult;
}

const getUserNfTsIR: any = {"usedParamSet":{"wallet":true},"params":[{"name":"wallet","required":false,"transform":{"type":"scalar"},"locs":[{"a":34,"b":40}]}],"statement":"SELECT * FROM nfts\nWHERE wallet = :wallet"};

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM nfts
 * WHERE wallet = :wallet
 * ```
 */
export const getUserNfTs = new PreparedQuery<IGetUserNfTsParams,IGetUserNfTsResult>(getUserNfTsIR);


/** 'GetLatestUserNft' parameters type */
export interface IGetLatestUserNftParams {
  wallet: string | null | void;
}

/** 'GetLatestUserNft' return type */
export interface IGetLatestUserNftResult {
  address: string;
  block_height: number;
  timestamp: Date | null;
  token_id: number;
  wallet: string;
}

/** 'GetLatestUserNft' query type */
export interface IGetLatestUserNftQuery {
  params: IGetLatestUserNftParams;
  result: IGetLatestUserNftResult;
}

const getLatestUserNftIR: any = {"usedParamSet":{"wallet":true},"params":[{"name":"wallet","required":false,"transform":{"type":"scalar"},"locs":[{"a":34,"b":40}]}],"statement":"SELECT * FROM nfts\nWHERE wallet = :wallet\nORDER BY block_height DESC\nLIMIT 1            "};

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM nfts
 * WHERE wallet = :wallet
 * ORDER BY block_height DESC
 * LIMIT 1            
 * ```
 */
export const getLatestUserNft = new PreparedQuery<IGetLatestUserNftParams,IGetLatestUserNftResult>(getLatestUserNftIR);


/** 'GetMapLayout' parameters type */
export interface IGetMapLayoutParams {
  name: string;
}

/** 'GetMapLayout' return type */
export interface IGetMapLayoutResult {
  layout: string;
  name: string;
}

/** 'GetMapLayout' query type */
export interface IGetMapLayoutQuery {
  params: IGetMapLayoutParams;
  result: IGetMapLayoutResult;
}

const getMapLayoutIR: any = {"usedParamSet":{"name":true},"params":[{"name":"name","required":true,"transform":{"type":"scalar"},"locs":[{"a":32,"b":37}]}],"statement":"SELECT * FROM maps\nWHERE name = :name!               "};

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM maps
 * WHERE name = :name!               
 * ```
 */
export const getMapLayout = new PreparedQuery<IGetMapLayoutParams,IGetMapLayoutResult>(getMapLayoutIR);


/** 'GetMatchConfig' parameters type */
export interface IGetMatchConfigParams {
  id: string | null | void;
}

/** 'GetMatchConfig' return type */
export interface IGetMatchConfigResult {
  content: string;
  id: string;
}

/** 'GetMatchConfig' query type */
export interface IGetMatchConfigQuery {
  params: IGetMatchConfigParams;
  result: IGetMatchConfigResult;
}

const getMatchConfigIR: any = {"usedParamSet":{"id":true},"params":[{"name":"id","required":false,"transform":{"type":"scalar"},"locs":[{"a":33,"b":35}]}],"statement":"SELECT * FROM configs\nWHERE id = :id               "};

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM configs
 * WHERE id = :id               
 * ```
 */
export const getMatchConfig = new PreparedQuery<IGetMatchConfigParams,IGetMatchConfigResult>(getMatchConfigIR);


/** 'GetPaginatedOpenLobbies' parameters type */
export interface IGetPaginatedOpenLobbiesParams {
  count: string | null | void;
  page: string | null | void;
  wallet: string | null | void;
}

/** 'GetPaginatedOpenLobbies' return type */
export interface IGetPaginatedOpenLobbiesResult {
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

/** 'GetPaginatedOpenLobbies' query type */
export interface IGetPaginatedOpenLobbiesQuery {
  params: IGetPaginatedOpenLobbiesParams;
  result: IGetPaginatedOpenLobbiesResult;
}

const getPaginatedOpenLobbiesIR: any = {"usedParamSet":{"wallet":true,"count":true,"page":true},"params":[{"name":"wallet","required":false,"transform":{"type":"scalar"},"locs":[{"a":114,"b":120}]},{"name":"count","required":false,"transform":{"type":"scalar"},"locs":[{"a":153,"b":158}]},{"name":"page","required":false,"transform":{"type":"scalar"},"locs":[{"a":167,"b":171}]}],"statement":"SELECT * FROM lobbies\nWHERE lobbies.lobby_state = 'open' AND lobbies.hidden IS FALSE AND lobbies.lobby_creator != :wallet\nORDER BY created_at DESC\nLIMIT :count\nOFFSET :page"};

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM lobbies
 * WHERE lobbies.lobby_state = 'open' AND lobbies.hidden IS FALSE AND lobbies.lobby_creator != :wallet
 * ORDER BY created_at DESC
 * LIMIT :count
 * OFFSET :page
 * ```
 */
export const getPaginatedOpenLobbies = new PreparedQuery<IGetPaginatedOpenLobbiesParams,IGetPaginatedOpenLobbiesResult>(getPaginatedOpenLobbiesIR);


/** 'SearchPaginatedOpenLobbies' parameters type */
export interface ISearchPaginatedOpenLobbiesParams {
  count: string | null | void;
  page: string | null | void;
  searchQuery: string | null | void;
  wallet: string | null | void;
}

/** 'SearchPaginatedOpenLobbies' return type */
export interface ISearchPaginatedOpenLobbiesResult {
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

/** 'SearchPaginatedOpenLobbies' query type */
export interface ISearchPaginatedOpenLobbiesQuery {
  params: ISearchPaginatedOpenLobbiesParams;
  result: ISearchPaginatedOpenLobbiesResult;
}

const searchPaginatedOpenLobbiesIR: any = {"usedParamSet":{"wallet":true,"searchQuery":true,"count":true,"page":true},"params":[{"name":"wallet","required":false,"transform":{"type":"scalar"},"locs":[{"a":114,"b":120}]},{"name":"searchQuery","required":false,"transform":{"type":"scalar"},"locs":[{"a":148,"b":159}]},{"name":"count","required":false,"transform":{"type":"scalar"},"locs":[{"a":192,"b":197}]},{"name":"page","required":false,"transform":{"type":"scalar"},"locs":[{"a":206,"b":210}]}],"statement":"SELECT * FROM lobbies\nWHERE lobbies.lobby_state = 'open' AND lobbies.hidden IS FALSE AND lobbies.lobby_creator != :wallet AND lobbies.lobby_id LIKE :searchQuery\nORDER BY created_at DESC\nLIMIT :count\nOFFSET :page"};

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM lobbies
 * WHERE lobbies.lobby_state = 'open' AND lobbies.hidden IS FALSE AND lobbies.lobby_creator != :wallet AND lobbies.lobby_id LIKE :searchQuery
 * ORDER BY created_at DESC
 * LIMIT :count
 * OFFSET :page
 * ```
 */
export const searchPaginatedOpenLobbies = new PreparedQuery<ISearchPaginatedOpenLobbiesParams,ISearchPaginatedOpenLobbiesResult>(searchPaginatedOpenLobbiesIR);


/** 'GetOpenLobbyById' parameters type */
export interface IGetOpenLobbyByIdParams {
  searchQuery: string | null | void;
  wallet: string | null | void;
}

/** 'GetOpenLobbyById' return type */
export interface IGetOpenLobbyByIdResult {
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

/** 'GetOpenLobbyById' query type */
export interface IGetOpenLobbyByIdQuery {
  params: IGetOpenLobbyByIdParams;
  result: IGetOpenLobbyByIdResult;
}

const getOpenLobbyByIdIR: any = {"usedParamSet":{"searchQuery":true,"wallet":true},"params":[{"name":"searchQuery","required":false,"transform":{"type":"scalar"},"locs":[{"a":80,"b":91}]},{"name":"wallet","required":false,"transform":{"type":"scalar"},"locs":[{"a":122,"b":128}]}],"statement":"SELECT * FROM lobbies\nWHERE lobbies.lobby_state = 'open' AND lobbies.lobby_id = :searchQuery AND lobbies.lobby_creator != :wallet"};

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM lobbies
 * WHERE lobbies.lobby_state = 'open' AND lobbies.lobby_id = :searchQuery AND lobbies.lobby_creator != :wallet
 * ```
 */
export const getOpenLobbyById = new PreparedQuery<IGetOpenLobbyByIdParams,IGetOpenLobbyByIdResult>(getOpenLobbyByIdIR);


/** 'GetRandomLobby' parameters type */
export type IGetRandomLobbyParams = void;

/** 'GetRandomLobby' return type */
export interface IGetRandomLobbyResult {
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

/** 'GetRandomLobby' query type */
export interface IGetRandomLobbyQuery {
  params: IGetRandomLobbyParams;
  result: IGetRandomLobbyResult;
}

const getRandomLobbyIR: any = {"usedParamSet":{},"params":[],"statement":"SELECT *\nFROM lobbies\nWHERE random() < 0.1\nAND lobbies.lobby_state = 'open' AND lobbies.hidden is FALSE\nLIMIT 1"};

/**
 * Query generated from SQL:
 * ```
 * SELECT *
 * FROM lobbies
 * WHERE random() < 0.1
 * AND lobbies.lobby_state = 'open' AND lobbies.hidden is FALSE
 * LIMIT 1
 * ```
 */
export const getRandomLobby = new PreparedQuery<IGetRandomLobbyParams,IGetRandomLobbyResult>(getRandomLobbyIR);


/** 'GetRandomActiveLobby' parameters type */
export type IGetRandomActiveLobbyParams = void;

/** 'GetRandomActiveLobby' return type */
export interface IGetRandomActiveLobbyResult {
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

/** 'GetRandomActiveLobby' query type */
export interface IGetRandomActiveLobbyQuery {
  params: IGetRandomActiveLobbyParams;
  result: IGetRandomActiveLobbyResult;
}

const getRandomActiveLobbyIR: any = {"usedParamSet":{},"params":[],"statement":"SELECT * FROM lobbies\nWHERE random() < 0.1\nAND lobbies.lobby_state = 'active'\nLIMIT 1"};

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM lobbies
 * WHERE random() < 0.1
 * AND lobbies.lobby_state = 'active'
 * LIMIT 1
 * ```
 */
export const getRandomActiveLobby = new PreparedQuery<IGetRandomActiveLobbyParams,IGetRandomActiveLobbyResult>(getRandomActiveLobbyIR);


/** 'GetUserLobbies' parameters type */
export interface IGetUserLobbiesParams {
  wallet: string | null | void;
}

/** 'GetUserLobbies' return type */
export interface IGetUserLobbiesResult {
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

/** 'GetUserLobbies' query type */
export interface IGetUserLobbiesQuery {
  params: IGetUserLobbiesParams;
  result: IGetUserLobbiesResult;
}

const getUserLobbiesIR: any = {"usedParamSet":{"wallet":true},"params":[{"name":"wallet","required":false,"transform":{"type":"scalar"},"locs":[{"a":127,"b":133},{"a":159,"b":165}]}],"statement":"SELECT * FROM lobbies\nWHERE lobbies.lobby_state != 'finished'\nAND lobbies.lobby_state != 'closed'\nAND (lobbies.lobby_creator = :wallet\nOR lobbies.player_two = :wallet)\nORDER BY created_at DESC"};

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM lobbies
 * WHERE lobbies.lobby_state != 'finished'
 * AND lobbies.lobby_state != 'closed'
 * AND (lobbies.lobby_creator = :wallet
 * OR lobbies.player_two = :wallet)
 * ORDER BY created_at DESC
 * ```
 */
export const getUserLobbies = new PreparedQuery<IGetUserLobbiesParams,IGetUserLobbiesResult>(getUserLobbiesIR);


/** 'GetPaginatedUserLobbies' parameters type */
export interface IGetPaginatedUserLobbiesParams {
  count: string | null | void;
  page: string | null | void;
  wallet: string | null | void;
}

/** 'GetPaginatedUserLobbies' return type */
export interface IGetPaginatedUserLobbiesResult {
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

/** 'GetPaginatedUserLobbies' query type */
export interface IGetPaginatedUserLobbiesQuery {
  params: IGetPaginatedUserLobbiesParams;
  result: IGetPaginatedUserLobbiesResult;
}

const getPaginatedUserLobbiesIR: any = {"usedParamSet":{"wallet":true,"count":true,"page":true},"params":[{"name":"wallet","required":false,"transform":{"type":"scalar"},"locs":[{"a":127,"b":133},{"a":159,"b":165}]},{"name":"count","required":false,"transform":{"type":"scalar"},"locs":[{"a":199,"b":204}]},{"name":"page","required":false,"transform":{"type":"scalar"},"locs":[{"a":213,"b":217}]}],"statement":"SELECT * FROM lobbies\nWHERE lobbies.lobby_state != 'finished'\nAND lobbies.lobby_state != 'closed'\nAND (lobbies.lobby_creator = :wallet\nOR lobbies.player_two = :wallet)\nORDER BY created_at DESC\nLIMIT :count\nOFFSET :page"};

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM lobbies
 * WHERE lobbies.lobby_state != 'finished'
 * AND lobbies.lobby_state != 'closed'
 * AND (lobbies.lobby_creator = :wallet
 * OR lobbies.player_two = :wallet)
 * ORDER BY created_at DESC
 * LIMIT :count
 * OFFSET :page
 * ```
 */
export const getPaginatedUserLobbies = new PreparedQuery<IGetPaginatedUserLobbiesParams,IGetPaginatedUserLobbiesResult>(getPaginatedUserLobbiesIR);


/** 'GetActiveLobbies' parameters type */
export type IGetActiveLobbiesParams = void;

/** 'GetActiveLobbies' return type */
export interface IGetActiveLobbiesResult {
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

/** 'GetActiveLobbies' query type */
export interface IGetActiveLobbiesQuery {
  params: IGetActiveLobbiesParams;
  result: IGetActiveLobbiesResult;
}

const getActiveLobbiesIR: any = {"usedParamSet":{},"params":[],"statement":"SELECT * FROM lobbies\nWHERE lobbies.lobby_state = 'active'"};

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM lobbies
 * WHERE lobbies.lobby_state = 'active'
 * ```
 */
export const getActiveLobbies = new PreparedQuery<IGetActiveLobbiesParams,IGetActiveLobbiesResult>(getActiveLobbiesIR);


/** 'GetLobbyById' parameters type */
export interface IGetLobbyByIdParams {
  lobby_id: string | null | void;
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

/** 'GetLobbyById' query type */
export interface IGetLobbyByIdQuery {
  params: IGetLobbyByIdParams;
  result: IGetLobbyByIdResult;
}

const getLobbyByIdIR: any = {"usedParamSet":{"lobby_id":true},"params":[{"name":"lobby_id","required":false,"transform":{"type":"scalar"},"locs":[{"a":39,"b":47}]}],"statement":"SELECT * FROM lobbies\nWHERE lobby_id = :lobby_id"};

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM lobbies
 * WHERE lobby_id = :lobby_id
 * ```
 */
export const getLobbyById = new PreparedQuery<IGetLobbyByIdParams,IGetLobbyByIdResult>(getLobbyByIdIR);


/** 'GetNewLobbiesByUserAndBlockHeight' parameters type */
export interface IGetNewLobbiesByUserAndBlockHeightParams {
  block_height: number | null | void;
  wallet: string | null | void;
}

/** 'GetNewLobbiesByUserAndBlockHeight' return type */
export interface IGetNewLobbiesByUserAndBlockHeightResult {
  lobby_id: string;
}

/** 'GetNewLobbiesByUserAndBlockHeight' query type */
export interface IGetNewLobbiesByUserAndBlockHeightQuery {
  params: IGetNewLobbiesByUserAndBlockHeightParams;
  result: IGetNewLobbiesByUserAndBlockHeightResult;
}

const getNewLobbiesByUserAndBlockHeightIR: any = {"usedParamSet":{"wallet":true,"block_height":true},"params":[{"name":"wallet","required":false,"transform":{"type":"scalar"},"locs":[{"a":51,"b":57}]},{"name":"block_height","required":false,"transform":{"type":"scalar"},"locs":[{"a":87,"b":99}]}],"statement":"SELECT lobby_id FROM lobbies\nWHERE lobby_creator = :wallet\nAND creation_block_height = :block_height"};

/**
 * Query generated from SQL:
 * ```
 * SELECT lobby_id FROM lobbies
 * WHERE lobby_creator = :wallet
 * AND creation_block_height = :block_height
 * ```
 */
export const getNewLobbiesByUserAndBlockHeight = new PreparedQuery<IGetNewLobbiesByUserAndBlockHeightParams,IGetNewLobbiesByUserAndBlockHeightResult>(getNewLobbiesByUserAndBlockHeightIR);


/** 'GetCurrentMatchState' parameters type */
export interface IGetCurrentMatchStateParams {
  lobby_id: string | null | void;
}

/** 'GetCurrentMatchState' return type */
export interface IGetCurrentMatchStateResult {
  current_match_state: Json;
}

/** 'GetCurrentMatchState' query type */
export interface IGetCurrentMatchStateQuery {
  params: IGetCurrentMatchStateParams;
  result: IGetCurrentMatchStateResult;
}

const getCurrentMatchStateIR: any = {"usedParamSet":{"lobby_id":true},"params":[{"name":"lobby_id","required":false,"transform":{"type":"scalar"},"locs":[{"a":57,"b":65}]}],"statement":"SELECT current_match_state FROM Lobbies\nWHERE lobby_id = :lobby_id             "};

/**
 * Query generated from SQL:
 * ```
 * SELECT current_match_state FROM Lobbies
 * WHERE lobby_id = :lobby_id             
 * ```
 */
export const getCurrentMatchState = new PreparedQuery<IGetCurrentMatchStateParams,IGetCurrentMatchStateResult>(getCurrentMatchStateIR);


/** 'GetRoundMoves' parameters type */
export interface IGetRoundMovesParams {
  lobby_id: string;
  round: number;
}

/** 'GetRoundMoves' return type */
export interface IGetRoundMovesResult {
  id: number;
  lobby_id: string;
  move_target: string;
  move_type: move_type;
  round: number;
  wallet: string;
}

/** 'GetRoundMoves' query type */
export interface IGetRoundMovesQuery {
  params: IGetRoundMovesParams;
  result: IGetRoundMovesResult;
}

const getRoundMovesIR: any = {"usedParamSet":{"lobby_id":true,"round":true},"params":[{"name":"lobby_id","required":true,"transform":{"type":"scalar"},"locs":[{"a":43,"b":52}]},{"name":"round","required":true,"transform":{"type":"scalar"},"locs":[{"a":68,"b":74}]}],"statement":"SELECT * FROM match_moves\nWHERE lobby_id = :lobby_id!\nAND   round = :round!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM match_moves
 * WHERE lobby_id = :lobby_id!
 * AND   round = :round!
 * ```
 */
export const getRoundMoves = new PreparedQuery<IGetRoundMovesParams,IGetRoundMovesResult>(getRoundMovesIR);


/** 'GetCachedMoves' parameters type */
export interface IGetCachedMovesParams {
  lobby_id: string | null | void;
}

/** 'GetCachedMoves' return type */
export interface IGetCachedMovesResult {
  id: number;
  lobby_id: string;
  move_target: string;
  move_type: move_type;
  round: number;
  wallet: string;
}

/** 'GetCachedMoves' query type */
export interface IGetCachedMovesQuery {
  params: IGetCachedMovesParams;
  result: IGetCachedMovesResult;
}

const getCachedMovesIR: any = {"usedParamSet":{"lobby_id":true},"params":[{"name":"lobby_id","required":false,"transform":{"type":"scalar"},"locs":[{"a":295,"b":303}]}],"statement":"SELECT \n  match_moves.id,\n  match_moves.lobby_id,\n  move_type,\n  move_target,\n  round,\n  wallet \nFROM match_moves\nINNER JOIN rounds\nON match_moves.lobby_id = rounds.lobby_id\nAND match_moves.round = rounds.round_within_match\nWHERE rounds.execution_block_height IS NULL\nAND match_moves.lobby_id = :lobby_id"};

/**
 * Query generated from SQL:
 * ```
 * SELECT 
 *   match_moves.id,
 *   match_moves.lobby_id,
 *   move_type,
 *   move_target,
 *   round,
 *   wallet 
 * FROM match_moves
 * INNER JOIN rounds
 * ON match_moves.lobby_id = rounds.lobby_id
 * AND match_moves.round = rounds.round_within_match
 * WHERE rounds.execution_block_height IS NULL
 * AND match_moves.lobby_id = :lobby_id
 * ```
 */
export const getCachedMoves = new PreparedQuery<IGetCachedMovesParams,IGetCachedMovesResult>(getCachedMovesIR);


/** 'GetMovesByLobby' parameters type */
export interface IGetMovesByLobbyParams {
  lobby_id: string | null | void;
}

/** 'GetMovesByLobby' return type */
export interface IGetMovesByLobbyResult {
  id: number;
  lobby_id: string;
  move_target: string;
  move_type: move_type;
  round: number;
  wallet: string;
}

/** 'GetMovesByLobby' query type */
export interface IGetMovesByLobbyQuery {
  params: IGetMovesByLobbyParams;
  result: IGetMovesByLobbyResult;
}

const getMovesByLobbyIR: any = {"usedParamSet":{"lobby_id":true},"params":[{"name":"lobby_id","required":false,"transform":{"type":"scalar"},"locs":[{"a":55,"b":63}]}],"statement":"SELECT *\nFROM match_moves\nWHERE match_moves.lobby_id = :lobby_id"};

/**
 * Query generated from SQL:
 * ```
 * SELECT *
 * FROM match_moves
 * WHERE match_moves.lobby_id = :lobby_id
 * ```
 */
export const getMovesByLobby = new PreparedQuery<IGetMovesByLobbyParams,IGetMovesByLobbyResult>(getMovesByLobbyIR);


