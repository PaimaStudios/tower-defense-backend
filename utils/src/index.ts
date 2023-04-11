import type { IGetMovesByLobbyResult } from '@tower-defense/db';
import { ENV } from 'paima-engine/paima-utils';
import type { Structure, TurnAction } from './types.js';
type VersionString = `${number}.${number}.${number}`;

const VERSION_MAJOR = 0;
const VERSION_MINOR = 1;
const VERSION_PATCH = 0;

export const gameBackendVersion: VersionString = `${VERSION_MAJOR}.${VERSION_MINOR}.${VERSION_PATCH}`;

export const GAME_NAME = 'Wrath of the Jungle';

// CONFIG VALUES
export class GameENV extends ENV {
  static get INDEXER_URI(): string {
    return process.env.INDEXER_URI || '';
  }
  static get STATEFUL_URI(): string {
    return process.env.STATEFUL_URI || '';
  }
  static get NFT_CONTRACT(): string {
    return process.env.NFT_CONTRACT || '';
  }
}

// OTHER CONSTANTS
export const PRACTICE_BOT_ADDRESS = '0x0101';

export * from './types.js';


/**
 * Converts DB data into a @type {TurnAction} object used throughout the codebase
 */
export function moveToAction(move: IGetMovesByLobbyResult, attacker: string): TurnAction {
  if (move.move_type === 'build') {
    const [structure, coordinates] = move.move_target.split('--');
    return {
      round: move.round,
      action: move.move_type,
      faction: move.wallet === attacker ? 'attacker' : 'defender',
      structure: structure as Structure,
      coordinates: parseInt(coordinates),
    };
  } else {
    return {
      round: move.round,
      action: move.move_type,
      faction: move.wallet === attacker ? 'attacker' : 'defender',
      id: parseInt(move.move_target),
    };
  }
}

export { parser as configParser, builder as configToConcise } from './config-parser';
