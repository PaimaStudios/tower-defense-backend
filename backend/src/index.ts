import { runPaimaEngine } from '@paima/engine';
import { generatePrecompiles } from '@paima/precompiles';

import RegisterRoutes from '@tower-defense/api';
import { GameENV } from '@tower-defense/utils';

import gameStateTransitionV1 from './stf/v1/index.js';
import gameStateTransitionV2 from './stf/v2/index.js';

function gameStateTransitionRouter(blockHeight: number) {
  if (blockHeight >= 0 && blockHeight < GameENV.LOBBY_AUTOPLAY_BLOCKHEIGHT) {
    return gameStateTransitionV1;
  }
  if (blockHeight >= GameENV.LOBBY_AUTOPLAY_BLOCKHEIGHT) {
    return gameStateTransitionV2;
  }
  return gameStateTransitionV1;
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
    }
  );
}

main();
