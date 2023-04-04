import type { Pool } from 'pg';
import type Prando from 'paima-engine/paima-prando';
import type { SubmittedChainData } from 'paima-engine/paima-utils';
import { SCHEDULED_DATA_ADDRESS } from 'paima-engine/paima-utils';

import type { SQLUpdate } from 'paima-engine/paima-db';
import parseInput from './parser.js';
import {
  processCreateLobby,
  processJoinLobby,
  processCloseLobby,
  processScheduledData,
  processSetNFT,
  processSubmittedTurn,
} from './transition.js';

export default async function (
  inputData: SubmittedChainData,
  blockHeight: number,
  randomnessGenerator: Prando,
  dbConn: Pool
): Promise<SQLUpdate[]> {
  console.log(inputData, 'parsing input data');
  const user = inputData.userAddress.toLowerCase();
  console.log(`Processing input string: ${inputData.inputData}`);
  const parsed = parseInput(inputData.inputData);
  console.log(`Input string parsed as: ${parsed.input}`);

  switch (parsed.input) {
    case 'createdLobby':
      return processCreateLobby(user, blockHeight, parsed, randomnessGenerator, dbConn);
    case 'joinedLobby':
      return processJoinLobby(user, blockHeight, parsed, randomnessGenerator, dbConn);
    case 'closedLobby':
      return processCloseLobby(user, parsed, dbConn);
    case 'submittedTurn':
      return processSubmittedTurn(blockHeight, user, parsed, randomnessGenerator, dbConn);
    case 'setNFT':
      return processSetNFT(user, blockHeight, parsed);
    case 'scheduledData':
      if (user !== SCHEDULED_DATA_ADDRESS) return [];
      return processScheduledData(parsed, blockHeight, randomnessGenerator, dbConn);
    case 'invalidString':
      return [];
    default:
      return [];
  }
}
