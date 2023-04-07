import { Controller, Get, Query, Route } from 'tsoa';
import type { IGetUserStatsResult } from '@tower-defense/db';
import { requirePool, getUserStats } from '@tower-defense/db';

interface Response {
  stats: IGetUserStatsResult;
}

@Route('user_stats')
export class userStatsController extends Controller {
  @Get()
  public async get(@Query() wallet: string): Promise<Response> {
    const pool = requirePool();
    wallet = wallet.toLowerCase();
    const [stats] = await getUserStats.run({ wallet }, pool);
    return { stats };
  }
}
