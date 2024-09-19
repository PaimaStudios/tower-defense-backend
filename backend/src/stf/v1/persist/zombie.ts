import type { SQLUpdate } from '@paima/db';
import { createScheduledData, deleteScheduledData } from '@paima/db';
import { precompiles } from '../../../index.js';

// Schedule a zombie round to be executed in the future
export function scheduleZombieRound(lobbyId: string, blockHeight: number): SQLUpdate {
  return createScheduledData(createZombieInput(lobbyId), { blockHeight }, { precompile: precompiles['scheduleZombieRound'] });
}

// Delete a scheduled zombie round to be executed in the future
export function deleteZombieRound(lobbyId: string, block_height: number): SQLUpdate {
  return deleteScheduledData(createZombieInput(lobbyId), block_height);
}

// Create the zombie round input
function createZombieInput(lobbyId: string): string {
  return `z|*${lobbyId}`;
}
