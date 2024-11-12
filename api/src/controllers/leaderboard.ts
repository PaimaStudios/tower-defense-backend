import { requirePool } from '@tower-defense/db';
import { Controller, Get, Query, Route } from 'tsoa';

interface LeaderboardEntryType {
  token_id: number;
  nft_contract: string;
  wins: number;
  draws: number;
  losses: number;
  total_games: number;
  score: number;
  current_streak: number;
  longest_streak: number;
}

interface LeaderboardEntryProps extends LeaderboardEntryType {
  position: number | string;
  avatar_url?: string;
  name?: string;
  wallet_address: string;
  wrapperClassname?: string;
}

@Route('leaderboard')
export class LeaderboardController extends Controller {
  @Get()
  public async get(@Query() frequency: string, @Query() previous: boolean): Promise<LeaderboardEntryProps[]> {
    console.log('/leaderboard', frequency, previous);
    const pool = requirePool();

    return [];
  }
}
