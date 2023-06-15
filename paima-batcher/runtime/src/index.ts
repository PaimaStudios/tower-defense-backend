import type { Pool } from 'pg';

import BatchedTransactionPoster from '@paima-batcher/batched-transaction-poster';
import { server, startServer } from '@paima-batcher/webserver';
import TowerDefenseValidator from '@paima-batcher/tower-defense-validator';
import GameInputValidator, {
  EmptyInputValidatorCoreInitializator,
  getErrors,
} from '@paima-batcher/game-input-validator';

import type { ErrorCode, ErrorMessageFxn, GameInputValidatorCore } from '@paima-batcher/utils';
import {
  BATCHED_MESSAGE_SIZE_LIMIT,
  BATCHED_TRANSACTION_POSTER_PERIOD,
  BATCHER_PRIVATE_KEY,
  TOWER_DEFENSE_BACKEND_URI,
  CHAIN_URI,
  GAME_INPUT_VALIDATOR_PERIOD,
  GAME_INPUT_VALIDATION_TYPE,
  getWalletWeb3AndAddress,
  keepRunning,
  requestStop,
  requestStart,
  STORAGE_CONTRACT_ADDRESS,
  GameInputValidatorCoreType,
  SUPPORTED_CHAIN_NAMES,
  VERSION_STRING,
  MAX_USER_INPUTS_PER_DAY,
  MAX_USER_INPUTS_PER_MINUTE,
  getAndConfirmWeb3,
} from '@paima-batcher/utils';

import { initializePool } from './pg/pgPool.js';
import type { BatcherRuntimeInitializer } from './types';

const MINIMUM_INTER_CATCH_PERIOD = 1000;
let batchedTransactionPosterReference: BatchedTransactionPoster | null = null;
let lastCatchDate = Date.now();
let reinitializingWeb3 = false;

process.on('SIGINT', () => {
  if (!keepRunning) process.exit(0);
  console.log('Caught SIGINT. Waiting for processes to finish...');
  requestStop();
});

process.on('SIGTERM', () => {
  if (!keepRunning) process.exit(0);
  console.log('Caught SIGTERM. Waiting for processes to finish...');
  requestStop();
});

process.on('uncaughtException', async err => {
  if (Date.now() - lastCatchDate < MINIMUM_INTER_CATCH_PERIOD) {
    return;
  }
  lastCatchDate = Date.now();
  console.error(err);
  if (!reinitializingWeb3 && batchedTransactionPosterReference) {
    reinitializingWeb3 = true;
    const walletWeb3 = await getAndConfirmWeb3(CHAIN_URI, BATCHER_PRIVATE_KEY, 1000);
    reinitializingWeb3 = false;
    batchedTransactionPosterReference.updateWeb3(walletWeb3);
  }
});

const ERROR_MESSAGES = getErrors(GAME_INPUT_VALIDATION_TYPE);

const errorCodeToMessage: ErrorMessageFxn = (errorCode: ErrorCode) => {
  if (!ERROR_MESSAGES.hasOwnProperty(errorCode)) {
    return 'Unknown error code: ' + errorCode;
  } else {
    return ERROR_MESSAGES[errorCode];
  }
};

async function getValidatorCore(
  validationType: GameInputValidatorCoreType
): Promise<GameInputValidatorCore> {
  switch (validationType) {
    case GameInputValidatorCoreType.TOWER_DEFENSE:
      return await TowerDefenseValidator.initialize(TOWER_DEFENSE_BACKEND_URI);
    case GameInputValidatorCoreType.NO_VALIDATION:
    default:
      return EmptyInputValidatorCoreInitializator.initialize();
  }
}

const BatcherRuntime: BatcherRuntimeInitializer = {
  initialize(pool: Pool) {
    return {
      addGET(route, callback) {
        server.get(route, callback);
      },
      addPOST(route, callback) {
        server.post(route, callback);
      },
      async run(gameInputValidator, batchedTransactionPoster) {
        // pass endpoints to web server and run
        (async () => startServer(pool, errorCodeToMessage))();
        gameInputValidator.run(GAME_INPUT_VALIDATOR_PERIOD);
        batchedTransactionPoster.run(BATCHED_TRANSACTION_POSTER_PERIOD);
      },
    };
  },
};

async function main() {
  const privateKey = BATCHER_PRIVATE_KEY;

  console.log(`Running paima-batcher version ${VERSION_STRING}`);
  console.log('Currently supporting signatures from the following chains:');
  for (const chain of SUPPORTED_CHAIN_NAMES) {
    console.log(` - ${chain}`);
  }

  console.log('CHAIN URI:', CHAIN_URI);
  console.log('Batched transaction poster period:', BATCHED_TRANSACTION_POSTER_PERIOD);
  console.log('Game input validator period:', GAME_INPUT_VALIDATOR_PERIOD);
  console.log('Validation type:', GAME_INPUT_VALIDATION_TYPE);
  console.log('Max inputs per minute:', MAX_USER_INPUTS_PER_MINUTE);
  console.log('Max inputs per day:', MAX_USER_INPUTS_PER_DAY);

  if (!BATCHED_TRANSACTION_POSTER_PERIOD || !GAME_INPUT_VALIDATOR_PERIOD) {
    console.error('[main] round periods too small! aborting...');
    return 1;
  }

  if (!MAX_USER_INPUTS_PER_DAY || !MAX_USER_INPUTS_PER_MINUTE) {
    console.error('[main] input limits too small! aborting...');
    return 1;
  }

  const pool = initializePool();
  const [walletWeb3, accountAddress] = await getWalletWeb3AndAddress(CHAIN_URI, privateKey);

  const gameInputValidatorCore = await getValidatorCore(GAME_INPUT_VALIDATION_TYPE);
  const gameInputValidator = new GameInputValidator(gameInputValidatorCore, pool);
  const batchedTransactionPoster = new BatchedTransactionPoster(
    walletWeb3,
    STORAGE_CONTRACT_ADDRESS,
    accountAddress,
    BATCHED_MESSAGE_SIZE_LIMIT,
    pool
  );
  batchedTransactionPosterReference = batchedTransactionPoster;
  await batchedTransactionPoster.initialize();

  const runtime = BatcherRuntime.initialize(pool);

  requestStart();
  runtime.run(gameInputValidator, batchedTransactionPoster);
}

main();
