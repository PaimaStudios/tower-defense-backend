import { GenericRejectionCode } from '@paima-batcher/utils';
import type { Structure } from './utils/types.js';

export const MAPS = [
  'jungle',
  'backwards',
  'crossing',
  'narrow',
  'snake',
  'straight',
  'wavy',
  'fork',
  'islands',
  'line',
  'reflection',
];

export const BOOLEANS = ['T', 'F', ''];

export const FACTIONS = ['a', 'r', 'd'];

export const TOWER_DEFENSE_ERROR_MESSAGES: Record<TowerDefenseRejectionCode, string> = {
  [TowerDefenseRejectionCode.INVALID_COMMAND]:
    'The supplied game input does not correspond to any supported command',

  [TowerDefenseRejectionCode.C_NUM_PARAMS]:
    'The createLobby command requires a different number of parameters',
  [TowerDefenseRejectionCode.C_NONNUMERIC_ARGS]:
    'One or more of the numeric parameters of createLobby have a non-numeric value',
  [TowerDefenseRejectionCode.C_NUM_ROUNDS]: 'The number of rounds parameter is out of range',
  [TowerDefenseRejectionCode.C_ROUND_LENGTH]: 'The round length parameter is out of range',
  [TowerDefenseRejectionCode.C_HIDDEN]: 'The isHidden parameter is not a valid boolean value',
  [TowerDefenseRejectionCode.C_MAP]: 'The selected map does not exist or is not supported',
  [TowerDefenseRejectionCode.C_PRACTICE]: 'The isPractice parameter is not a valid boolean value',
  [TowerDefenseRejectionCode.C_INVALID_MATCH_CONFIG_ID]: 'The provided match config is not valid',
  [TowerDefenseRejectionCode.C_FACTION]: 'The selected faction does not exist or is not supported',
  [TowerDefenseRejectionCode.C_UNKNOWN]: 'Unknown error while processing a createLobby command',

  [TowerDefenseRejectionCode.J_NUM_PARAMS]:
    'The joinLobby command requires a different number of parameters',
  [TowerDefenseRejectionCode.J_INVALID_LOBBY_ID]: 'The supplied lobby ID is invalid',
  [TowerDefenseRejectionCode.J_NONEXISTENT_LOBBY]: 'The specified lobby does not exist',
  [TowerDefenseRejectionCode.J_LOBBY_NOT_OPEN]: 'The specified lobby is not open',
  [TowerDefenseRejectionCode.J_PLAYER_CREATED_LOBBY]: 'A player cannot join their own lobby',
  [TowerDefenseRejectionCode.J_UNKNOWN]: 'Unknown error while processing a joinLobby command',

  [TowerDefenseRejectionCode.S_NUM_PARAMS]:
    'The submitMoves command requires a different number of parameters',
  [TowerDefenseRejectionCode.S_INVALID_LOBBY_ID]: 'The supplied lobby ID is invalid',
  [TowerDefenseRejectionCode.S_NONNUMERIC_ROUND_NUMBER]:
    'The supplied round number is not a valid integer',
  [TowerDefenseRejectionCode.S_NONEXISTENT_LOBBY]: 'The specified lobby does not exist',
  [TowerDefenseRejectionCode.S_LOBBY_NOT_ACTIVE]: 'The specified lobby is not active',
  [TowerDefenseRejectionCode.S_WRONG_ROUND]:
    'The supplied round number does not correspond to the current round of the specified lobby',
  [TowerDefenseRejectionCode.S_PLAYER_NOT_IN_LOBBY]: 'The user is not in the specified lobby',
  [TowerDefenseRejectionCode.S_NONNUMERIC_PARAM]:
    'Invalid moves: the position parameter must be a number',
  [TowerDefenseRejectionCode.S_UNSUPPORTED_MOVE]:
    'Invalid moves: one or more unknown or unsupported moves',
  [TowerDefenseRejectionCode.S_INVALID_MOVES]: 'One or more of the specified moves are invalid',
  [TowerDefenseRejectionCode.S_SEMANTIC]: 'Submitted moves not allowed',
  [TowerDefenseRejectionCode.S_B_INVALID_PARAMS]: 'Invalid parameters of build command',
  [TowerDefenseRejectionCode.S_UNKNOWN]: 'Unknown error while processing a submitMoves command',

  [TowerDefenseRejectionCode.N_NUM_PARAMS]:
    'The setNft command requires a different number of parameters',
  [TowerDefenseRejectionCode.N_NONNUMERIC_TOKEN_ID]: 'The supplied token ID is not a valid integer',
  [TowerDefenseRejectionCode.N_NEGATIVE_TOKEN_ID]: 'The supplied token ID is negative',

  [TowerDefenseRejectionCode.CS_NUM_PARAMS]:
    'The closeLobby command requires a different number of parameters',
  [TowerDefenseRejectionCode.CS_INVALID_LOBBY_ID]: 'The supplied lobby ID is invalid',
  [TowerDefenseRejectionCode.CS_NONEXISTENT_LOBBY]: 'The specified lobby does not exist',
  [TowerDefenseRejectionCode.CS_LOBBY_NOT_OPEN]: 'The specified lobby is not open',
  [TowerDefenseRejectionCode.CS_PLAYER_DIDNT_CREATE_LOBBY]:
    'A player can only close their own lobby',
  [TowerDefenseRejectionCode.CS_UNKNOWN]: 'Unknown error while processing a closeLobby command',

  [TowerDefenseRejectionCode.R_NOT_SUPPORTED]:
    'Posting registerConfig through batcher is not supported',
};

export const enum TowerDefenseRejectionCode {
  // generic errors:
  INVALID_COMMAND = GenericRejectionCode.INVALID_GAME_INPUT + 1,

  // createLobby errors:
  C_NUM_PARAMS,
  C_NONNUMERIC_ARGS,
  C_NUM_ROUNDS,
  C_ROUND_LENGTH,
  C_HIDDEN,
  C_MAP,
  C_PRACTICE,
  C_INVALID_MATCH_CONFIG_ID,
  C_FACTION,
  C_UNKNOWN,

  // joinLobby errors:
  J_NUM_PARAMS,
  J_INVALID_LOBBY_ID,
  J_NONEXISTENT_LOBBY,
  J_LOBBY_NOT_OPEN,
  J_PLAYER_CREATED_LOBBY,
  J_UNKNOWN,

  // submitMoves errors:
  S_NUM_PARAMS,
  S_INVALID_LOBBY_ID,
  S_NONNUMERIC_ROUND_NUMBER,
  S_NONEXISTENT_LOBBY,
  S_LOBBY_NOT_ACTIVE,
  S_WRONG_ROUND,
  S_PLAYER_NOT_IN_LOBBY,
  S_NONNUMERIC_PARAM,
  S_UNSUPPORTED_MOVE,
  S_INVALID_MOVES,
  S_SEMANTIC,
  S_B_INVALID_PARAMS,
  S_UNKNOWN,

  // setNft errors:
  N_NUM_PARAMS,
  N_NONNUMERIC_TOKEN_ID,
  N_NEGATIVE_TOKEN_ID,

  // closeLobby errors:
  CS_NUM_PARAMS,
  CS_INVALID_LOBBY_ID,
  CS_NONEXISTENT_LOBBY,
  CS_LOBBY_NOT_OPEN,
  CS_PLAYER_DIDNT_CREATE_LOBBY,
  CS_UNKNOWN,

  // registerConfig errors:
  R_NOT_SUPPORTED,
}

export const STRUCTURE_NAMES: Record<string, Structure> = {
  ['at']: 'anacondaTower',
  ['pt']: 'piranhaTower',
  ['st']: 'slothTower',
  ['gc']: 'gorillaCrypt',
  ['jc']: 'jaguarCrypt',
  ['mc']: 'macawCrypt',
};
