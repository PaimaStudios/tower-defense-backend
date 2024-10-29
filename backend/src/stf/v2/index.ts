import type { PoolClient } from 'pg';
import type Prando from '@paima/prando';
import type { PreExecutionBlockHeader, SubmittedChainData } from '@paima/chain-types';
import { SCHEDULED_DATA_ADDRESS } from '@paima/utils';

import type { SQLUpdate } from '@paima/db';
import parseInput from './parser.js';
import {
  processCreateLobby,
  processJoinLobby,
  processCloseLobby,
  processScheduledData,
  processSetNFT,
  processSubmittedTurn,
  processConfig,
} from './transition.js';
import { scheduleWipeOldLobbies, wipeSchedule } from './persist/wipe.js';

export default async function (
  inputData: SubmittedChainData,
  blockHeader: PreExecutionBlockHeader,
  randomnessGenerator: Prando,
  dbConn: PoolClient
): Promise<{ stateTransitions: SQLUpdate[], events: [] }> {
  const { blockHeight } = blockHeader;
  console.log(inputData, 'parsing input data');

  if (inputData.inputData.startsWith('&')) {
    // DelegateWallet command, we can ignore it.
    // If we cared, we could add them to the parser.
    return {
      stateTransitions: [],
      events: [],
    };
  }

  const user = inputData.realAddress.toLowerCase();
  console.log(`Processing input string: ${inputData.inputData}`);
  const parsed = parseInput(inputData.inputData);
  console.log(`Input string parsed as: ${parsed.input}`);
  let queries: SQLUpdate[] = [];
  if (parsed.input === 'createdLobby')
    queries = await processCreateLobby(user, blockHeight, parsed, randomnessGenerator, dbConn);
  else if (parsed.input === 'joinedLobby')
    queries = await processJoinLobby(user, blockHeight, parsed, randomnessGenerator, dbConn);
  else if (parsed.input === 'closedLobby') queries = await processCloseLobby(user, parsed, dbConn);
  else if (parsed.input === 'submittedTurn')
    queries = await processSubmittedTurn(blockHeight, user, parsed, randomnessGenerator, dbConn);
  else if (parsed.input === 'setNFT') queries = await processSetNFT(user, blockHeight, parsed);
  else if (parsed.input === 'scheduledData' && user === SCHEDULED_DATA_ADDRESS)
    queries = await processScheduledData(parsed, blockHeight, randomnessGenerator, dbConn);
  else if (parsed.input === 'registeredConfig')
    queries = await processConfig(user, parsed, randomnessGenerator);
  // add schedule data to wipe old lobbies on set schedule
  const wiping = await wipeSchedule(blockHeight, dbConn);
  return {
    stateTransitions: wiping ? [...queries, scheduleWipeOldLobbies(blockHeight)] : queries,
    events: [],
  };
}
