import type { ErrorCode } from '@paima-batcher/utils';
import { STRUCTURE_NAMES, TowerDefenseRejectionCode } from './constants.js';
import { queryLobbyState } from './query-constructors.js';
import type {
  BaseAction,
  BuildStructureAction,
  Faction,
  RepairStructureAction,
  SalvageStructureAction,
  TurnAction,
  UpgradeStructureAction,
} from './utils/types.js';

type LobbyState = any;

export async function validateLobbyGetState(
  lobbyID: string,
  userAddress: string,
  currentRound: number,
  backendUri: string
): Promise<[ErrorCode, LobbyState]> {
  userAddress = userAddress.toLowerCase();
  try {
    const queryLobby = queryLobbyState(backendUri, lobbyID);
    const lobbyStateResponse = await fetch(queryLobby);
    const lobbyState: LobbyState = await lobbyStateResponse.json();
    if (lobbyState.lobby === null) {
      console.log('[tower-defense-validator] Lobby does not exist');
      return [TowerDefenseRejectionCode.S_NONEXISTENT_LOBBY, null];
    }
    if (lobbyState.lobby.lobby_id !== lobbyID) {
      console.log('[tower-defense-validator] Lobby with different ID returned');
      return [TowerDefenseRejectionCode.S_INVALID_LOBBY_ID, null];
    }
    if (lobbyState.lobby.lobby_state !== 'active') {
      console.log('[tower-defense-validator] Lobby not active');
      return [TowerDefenseRejectionCode.S_LOBBY_NOT_ACTIVE, null];
    }
    if (lobbyState.lobby.current_round !== currentRound) {
      console.log('[tower-defense-validator] Lobby in a different round');
      return [TowerDefenseRejectionCode.S_WRONG_ROUND, null];
    }
    if (
      lobbyState.lobby.lobby_creator !== userAddress &&
      lobbyState.lobby.player_two !== userAddress
    ) {
      console.log('[tower-defense-validator] Player not in lobby');
      return [TowerDefenseRejectionCode.S_PLAYER_NOT_IN_LOBBY, null];
    }

    return [0, lobbyState];
  } catch (err) {
    console.log('[tower-defense-validator] Error while querying lobby state:', err);
    return [TowerDefenseRejectionCode.S_UNKNOWN, null];
  }
}

export function parseMoves(moves: string[], round: number, faction: Faction): TurnAction[] {
  const baseAction: BaseAction = {
    round,
    faction,
  } as BaseAction;
  return moves.map(move => parseMove(move, baseAction));
}

function parseMove(move: string, baseAction: BaseAction): TurnAction {
  const [prefix, body] = [move[0], move.slice(1)];
  switch (prefix) {
    case 'b':
      return parseBuild(body, baseAction);
    case 'r':
      return parseRepair(body, baseAction);
    case 'u':
      return parseUpgrade(body, baseAction);
    case 's':
      return parseSalvage(body, baseAction);
    default:
      throw TowerDefenseRejectionCode.S_UNSUPPORTED_MOVE;
  }
}

function parseBuild(body: string, baseAction: BaseAction): BuildStructureAction {
  try {
    const [coordsStr, structType, ...remainder] = body.split(',');
    if (!coordsStr || !structType || remainder.length > 0) {
      throw TowerDefenseRejectionCode.S_B_INVALID_PARAMS;
    }
    if (!/^[0-9]+$/.test(coordsStr)) {
      throw TowerDefenseRejectionCode.S_NONNUMERIC_PARAM;
    }
    const coords = parseInt(coordsStr, 10);
    const longStructType = STRUCTURE_NAMES[structType];
    if (!longStructType) {
      throw TowerDefenseRejectionCode.S_B_INVALID_PARAMS;
    }
    return {
      ...baseAction,
      action: 'build',
      coordinates: coords,
      structure: longStructType,
    };
  } catch (err) {
    console.error('[parseBuild] error:', err);
    throw TowerDefenseRejectionCode.S_UNKNOWN;
  }
}

function parseRepair(body: string, baseAction: BaseAction): RepairStructureAction {
  try {
    if (!/^[0-9]+$/.test(body)) {
      throw TowerDefenseRejectionCode.S_NONNUMERIC_PARAM;
    }
    const structId = parseInt(body, 10);
    return {
      ...baseAction,
      action: 'repair',
      id: structId,
    };
  } catch (err) {
    console.error('[parseRepair] error:', err);
    throw TowerDefenseRejectionCode.S_UNKNOWN;
  }
}

function parseUpgrade(body: string, baseAction: BaseAction): UpgradeStructureAction {
  try {
    if (!/^[0-9]+$/.test(body)) {
      throw TowerDefenseRejectionCode.S_NONNUMERIC_PARAM;
    }
    const structId = parseInt(body, 10);
    return {
      ...baseAction,
      action: 'upgrade',
      id: structId,
    };
  } catch (err) {
    console.error('[parseUpgrade] error:', err);
    throw TowerDefenseRejectionCode.S_UNKNOWN;
  }
}

function parseSalvage(body: string, baseAction: BaseAction): SalvageStructureAction {
  try {
    if (!/^[0-9]+$/.test(body)) {
      throw TowerDefenseRejectionCode.S_NONNUMERIC_PARAM;
    }
    const structId = parseInt(body, 10);
    return {
      ...baseAction,
      action: 'salvage',
      id: structId,
    };
  } catch (err) {
    console.error('[parseSalvage] error:', err);
    throw TowerDefenseRejectionCode.S_UNKNOWN;
  }
}

/*
export function validateMove(
    move: string
): ErrorCode {
    const [prefix, body] = [move[0], move.slice(1)];
    switch (prefix) {
        case "b":
            return validateBuild(body);
        case "r":
            return validateRepair(body);
        case "u":
            return validateUpgrade(body);
        case "s":
            return validateSalvage(body);
        default:
            return TowerDefenseRejectionCode.S_UNSUPPORTED_MOVE;
    }

    return 0;
}

function validateBuild(body: string): ErrorCode {
    try {
        const [coordsStr, structType, ...remainder] = body.split(",");
        if (!coordsStr || !structType || remainder.length > 0) {
            return TowerDefenseRejectionCode.S_B_INVALID_PARAMS;
        }
        if (!/^[0-9]+$/.test(coordsStr)) {
            return TowerDefenseRejectionCode.S_NONNUMERIC_PARAM;
        }
        const coords = parseInt(coordsStr, 10);
    } catch (err) {
        console.error("[validateBuild] error:", err);
    }
}

function validateRepair(body: string): ErrorCode {
    try {
        if (!/^[0-9]+$/.test(body)) {
            return TowerDefenseRejectionCode.S_NONNUMERIC_PARAM;
        }
        const structId = parseInt(body, 10);
    } catch (err) {
        console.error("[validateRepair] error:", err);
        return TowerDefenseRejectionCode.S_UNKNOWN;
    }
}

function validateUpgrade(body: string): ErrorCode {
    try {
        if (!/^[0-9]+$/.test(body)) {
            return TowerDefenseRejectionCode.S_NONNUMERIC_PARAM;
        }
        const structId = parseInt(body, 10);
    } catch (err) {
        console.error("[validateUpgrade] error:", err);
        return TowerDefenseRejectionCode.S_UNKNOWN;
    }
}

function validateSalvage(body: string): ErrorCode {
    try {
        if (!/^[0-9]+$/.test(body)) {
            return TowerDefenseRejectionCode.S_NONNUMERIC_PARAM;
        }
        const structId = parseInt(body, 10);
    } catch (err) {
        console.error("[validateSalvage] error:", err);
        return TowerDefenseRejectionCode.S_UNKNOWN;
    }
}
*/
