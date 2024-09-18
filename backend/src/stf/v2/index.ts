import type { Pool } from 'pg';
import type Prando from '@paima/prando';
import type { SubmittedChainData } from '@paima/chain-types';
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
  blockHeight: number,
  randomnessGenerator: Prando,
  dbConn: Pool
): Promise<SQLUpdate[]> {
  console.log(inputData, 'parsing input data');
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
  return wiping ? [...queries, scheduleWipeOldLobbies(blockHeight)] : queries;
}
