import { getLastScheduledWiping, getOldLobbies, wipeOldlobbies } from '@tower-defense/db';
import type { SQLUpdate } from 'paima-engine/paima-db';
import { createScheduledData } from 'paima-engine/paima-db';
import type { Pool } from 'pg';


const interval = Number(process.env.DB_WIPE_SCHEDULE) || 7;

export async function wipeSchedule(blockHeight: number, dbConn: Pool): Promise<boolean> {
  // weekly cleanup
  const blocksInDay = (60 * 60 * 24) / Number(process.env.BLOCK_TIME)
  // fetch last scheduled wiping from the db 
  const [last] = await getLastScheduledWiping.run(undefined, dbConn);
  // Check that last wipe was before the set interval
  const wipeSchedule = (last && (blockHeight - last.block_height) > (blocksInDay * interval))
  if (wipeSchedule) {
    // check if there are any old lobbies around
    const date = new Date(new Date().setDate(new Date().getDate() - interval)); 
    const lobbies = await getOldLobbies.run({date}, dbConn);
    return lobbies.length > 0;
  } else return false;
}
// Schedule a zombie round to be executed in the future
export function scheduleWipeOldLobbies(block_height: number): SQLUpdate {
  return createScheduledData(createWipeInput(interval), block_height);
}

// Create the wipe old lobbies input
function createWipeInput(days: number): string {
  return `w|${days}`;
}

export function wipeOldLobbies(): SQLUpdate {
  const date = new Date(new Date().setDate(new Date().getDate() - interval)); 
  return [wipeOldlobbies, {date}];
}
