export const gameBackendVersion = '0.1.0';

// TODO: dotenv config

export const CHAIN_URI = process.env.CHAIN_URI || 'https://rpc-devnet-cardano-evm.c1.milkomeda.com';
export const CHAIN_NAME = process.env.CHAIN_NAME || 'Milkomeda Cardano Testnet';
export const CHAIN_ID = parseInt(process.env.CHAIN_ID || '200101', 10);
export const CHAIN_EXPLORER_URI = process.env.CHAIN_EXPLORER_URI || '';
export const CHAIN_CURRENCY_NAME = process.env.CHAIN_CURRENCY_NAME || '';
export const CHAIN_CURRENCY_SYMBOL = process.env.CHAIN_CURRENCY_SYMBOL || '';
export const CHAIN_CURRENCY_DECIMALS = parseInt(process.env.CHAIN_CURRENCY_DECIMALS || '0', 10);

export const STORAGE_ADDRESS =
  process.env.STORAGE_ADDRESS || '0x852Ec3e5C0900C94206bCB4c09D9967238eBE122'; // from catapult
export const STORAGE_CONTRACT_DEPLOYMENT_BLOCKHEIGHT = parseInt(
  process.env.STORAGE_CONTRACT_DEPLOYMENT_BLOCKHEIGHT || '0'
);
export const DEFAULT_FEE = process.env.DEFAULT_FEE || '10000000000000000';
export const DEPLOYMENT = process.env.DEPLOYMENT || 'C1';
export const START_BLOCKHEIGHT = parseInt(process.env.START_BLOCKHEIGHT || '0', 10);

export const BACKEND_URI = process.env.BACKEND_URI || 'https://td-backend.paimastudios.com';
export const INDEXER_URI = process.env.INDEXER_URI || 'https://nfts.paimastudios.com';
//export const BATCHER_URI = "http://jw-backend.paimastudios.com:3334";
export const BATCHER_URI = process.env.BATCHER_URI || 'http://localhost:3334';
export const STATEFUL_URI = process.env.STATEFUL_URI || '';
export const SERVER_ONLY_MODE = process.env.SERVER_ONLY_MODE === 'true';

export const NFT_CONTRACT = process.env.NFT_CONTRACT || '';
export const STOP_BLOCKHEIGHT = process.env.STOP_BLOCKHEIGHT
  ? parseInt(process.env.STOP_BLOCKHEIGHT)
  : null;

export const PRACTICE_BOT_ADDRESS = '0x0101';

export * from './types.js';

export { parse, ParsedSubmittedInput, InvalidInput } from './parser.js';
