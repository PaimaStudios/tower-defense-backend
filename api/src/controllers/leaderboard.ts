import { getNftLeaderboards, requirePool } from '@tower-defense/db';
import { Controller, Get, Query, Request, Route } from 'tsoa';
import { Request as ExpressRequest } from 'express';

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

@Route('leaderboards')
export class LeaderboardsController extends Controller {
  @Get()
  public async get(@Query() frequency: string, @Query() previous: boolean): Promise<LeaderboardEntryProps[]> {
    // Note: the frontend only has two tabs, "Global" and "All-time Streak",
    // and both send frequency=weekly&previous=false, so we can be simple here.
    const pool = requirePool();

    const nfts = await getNftLeaderboards.run(undefined, pool);
    let [position, position_score] = [0, Infinity];
    return nfts.map((nft, index) => {
      // Give those with the same score the same ordinal position.
      const score = nft.wins * 10 - nft.losses;
      if (score < position_score) {
        position = index + 1;
        position_score = score;
      }

      return {
        token_id: Number(nft.token_id),
        nft_contract: 'TODO',
        wins: nft.wins,
        draws: 0,
        losses: nft.losses,
        total_games: nft.wins + nft.losses,
        score: nft.wins * 10 - nft.losses,
        current_streak: nft.streak,
        longest_streak: nft.best_streak,

        position,
        avatar_url: `/trainer-image/${nft.token_id}.png`,
        name: `Tarochi Genesis Trainer #${nft.token_id}`,
        wallet_address: nft.nft_owner ?? '',
      }
    });
  }
}
