import { getLastScheduledWiping, getOldLobbies, wipeOldlobbies } from '@tower-defense/db';
import type { SQLUpdate } from '@paima/db';
import { createScheduledData } from '@paima/db';
import type { PoolClient } from 'pg';
import { precompiles } from '../../../index.js';

const interval = Number(process.env.DB_WIPE_SCHEDULE) || 7;

export async function wipeSchedule(blockHeight: number, dbConn: PoolClient): Promise<boolean> {
  // weekly cleanup
  const blocksInDay = (60 * 60 * 24) / Number(process.env.BLOCK_TIME);
  // fetch last scheduled wiping from the db
  const [last] = await getLastScheduledWiping.run({ precompile: precompiles['scheduleWipeOldLobbies'] }, dbConn);
  // Check that last wipe was before the set interval
  const wipeSchedule = last && blockHeight - last.block_height > blocksInDay * interval;
  if (wipeSchedule) {
    // check if there are any old lobbies around
    const date = new Date(new Date().setDate(new Date().getDate() - interval));
    const lobbies = await getOldLobbies.run({ date }, dbConn);
    return lobbies.length > 0;
  } else return false;
}
// Schedule a zombie round to be executed in the future
export function scheduleWipeOldLobbies(blockHeight: number): SQLUpdate {
  return createScheduledData(createWipeInput(interval), { blockHeight }, { precompile: precompiles['scheduleWipeOldLobbies'] });
}

// Create the wipe old lobbies input
function createWipeInput(days: number): string {
  return `w|${days}`;
}

export function wipeOldLobbies(days: number): SQLUpdate {
  const date = new Date(new Date().setDate(new Date().getDate() - days));
  return [wipeOldlobbies, { date }];
}
