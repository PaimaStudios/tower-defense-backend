import { Controller, Get, Query, Route } from 'tsoa';
import type { IGetUserStatsResult } from '@tower-defense/db';
import { requirePool, getUserStats } from '@tower-defense/db';

interface UserStatsResponse {
  stats: IGetUserStatsResult;
}

@Route('user_stats')
export class userStatsController extends Controller {
  @Get()
  public async get(@Query() wallet: string): Promise<UserStatsResponse> {
    const pool = requirePool();
    wallet = wallet.toLowerCase();
    const [stats] = await getUserStats.run({ wallet }, pool);
    return { stats };
  }
}
