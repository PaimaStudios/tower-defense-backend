import type { SQLUpdate } from '@paima/db';
import { createScheduledData } from '@paima/db';
import type { IGetUserStatsResult, INewStatsParams, IUpdateStatsParams } from '@tower-defense/db';
import { updateStats } from '@tower-defense/db';
import { newStats } from '@tower-defense/db';
import type { WalletAddress } from '@paima/chain-types';
import type { Result, ResultConcise } from '@tower-defense/utils';
import { precompiles } from '../../../index.js';

// Generate blank/empty user stats
export function blankStats(wallet: string): SQLUpdate {
  const params: INewStatsParams = {
    stats: {
      wallet: wallet,
      wins: 0,
      losses: 0,
    },
  };
  return [newStats, params];
}

// Persist updating user stats in DB
export function persistStatsUpdate(
  user: WalletAddress,
  result: ResultConcise,
  stats: IGetUserStatsResult
): SQLUpdate {
  const userParams: IUpdateStatsParams = {
    stats: {
      wallet: user,
      wins: result === 'w' ? stats.wins + 1 : stats.wins,
      losses: result === 'l' ? stats.losses + 1 : stats.losses,
    },
  };
  return [updateStats, userParams];
}

// Schedule a stats update to be executed in the future
export function scheduleStatsUpdate(
  wallet: WalletAddress,
  result: Result,
  blockHeight: number
): SQLUpdate {
  return createScheduledData(createStatsUpdateInput(wallet, result), { blockHeight }, { precompile: precompiles['scheduleStatsUpdate'] });
}

const conciseResult: Record<Result, ResultConcise> = {
  win: 'w',
  loss: 'l',
};

// Create stats update input
function createStatsUpdateInput(wallet: WalletAddress, result: Result): string {
  return `u|*${wallet}|${conciseResult[result]}`;
}
