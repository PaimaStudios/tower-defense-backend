import { runPaimaEngine } from '@paima/engine';
import { generatePrecompiles } from '@paima/precompiles';

import RegisterRoutes from '@tower-defense/api';

// NOTE: v1 was retired during the 2024 Q4 state reset
import gameStateTransitionV2 from './stf/v2/index.js';
import { metadata } from './achievements.js';

function gameStateTransitionRouter(blockHeight: number) {
  return gameStateTransitionV2;
}

export enum PrecompileNames {
  ScheduleStatsUpdate = 'scheduleStatsUpdate',
  ScheduleWipeOldLobbies = 'scheduleWipeOldLobbies',
  ScheduleZombieRound = 'scheduleZombieRound',
}
export const precompiles = generatePrecompiles(PrecompileNames);

const events = {};

async function main() {
  await runPaimaEngine(
    gameStateTransitionRouter,
    precompiles,
    events,
    {}, // todo: openapi
    {
      default: RegisterRoutes,
      achievements: Promise.resolve(metadata),
    }
  );
}

main();
