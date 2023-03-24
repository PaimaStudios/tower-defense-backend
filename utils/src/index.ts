import { ENV } from 'paima-engine/paima-utils';
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

export { tryParseConfig, parseInput, ParsedSubmittedInput, InvalidInput } from './parser.js';
