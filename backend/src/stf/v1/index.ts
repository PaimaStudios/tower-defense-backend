import type { Pool } from 'pg';
import Prando from 'paima-engine/paima-prando';
import { SCHEDULED_DATA_ADDRESS, SubmittedChainData } from 'paima-engine/paima-utils';

import { SQLUpdate } from 'paima-engine/paima-db';
import { parseInput } from './parser.js';
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
  const expanded = parseInput(inputData.inputData);
  console.log(`Input string parsed as: ${expanded.input}`);

  switch (expanded.input) {
    case 'createdLobby':
      return processCreateLobby(user, blockHeight, expanded, randomnessGenerator, dbConn);
    case 'joinedLobby':
      return processJoinLobby(user, blockHeight, expanded, randomnessGenerator, dbConn);
    case 'closedLobby':
      return processCloseLobby(user, expanded, dbConn);
    case 'submittedTurn':
      return processSubmittedTurn(blockHeight, user, expanded, randomnessGenerator, dbConn);
    case 'setNFT':
      return processSetNFT(user, blockHeight, expanded);
    case 'scheduledData':
      if (user !== SCHEDULED_DATA_ADDRESS) return [];
      return processScheduledData(expanded, blockHeight, randomnessGenerator, dbConn);
    case 'invalidString':
      return [];
    default:
      return [];
  }
}
