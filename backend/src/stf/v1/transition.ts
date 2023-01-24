import type { Pool } from 'pg';

import parse, { isInvalid } from './parser.js';
import Prando from 'paima-engine/paima-prando';
import { SCHEDULED_DATA_ADDRESS, SQLUpdate, SubmittedChainData } from 'paima-engine/paima-utils';
import {
  executeZombieRound,
  persistCloseLobby,
  persistLobbyCreation,
  persistLobbyJoin,
  persistMoveSubmission,
  persistNFT,
  persistStatsUpdate,
} from './persist.js';

export default async function (
  inputData: SubmittedChainData,
  blockHeight: number,
  randomnessGenerator: Prando,
  dbConn: Pool
): Promise<SQLUpdate[]> {
  console.log(inputData, 'parsing input data');
  const user = inputData.userAddress.toLowerCase();
  console.log(`Processing input string: ${inputData.inputData}`);
  const expanded = parse(inputData.inputData);
  if (isInvalid(expanded)) {
    console.log(`Invalid input string`);
    return [];
  }
  console.log(`Input string parsed as: ${expanded.name}`);

  switch (expanded.name) {
    case 'anacondaTower':
    case 'piranhaTower':
    case 'slothTower':
    case 'gorillaCrypt':
    case 'jaguarCrypt':
    case 'macawCrypt':
    case 'baseGoldRate':
      return [];
  }
}
