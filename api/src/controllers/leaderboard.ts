import { getNftLeaderboards, requirePool } from '@tower-defense/db';
import { Controller, Get, Query, Request, Route } from 'tsoa';
import { cdeName, generateNameFromString } from '@tower-defense/utils';

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
  wallet_alias?: string;
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
      const score = nft.score ?? 0;  // Calc'd in SQL for ordering purposes.
      if (score < position_score) {
        position = index + 1;
        position_score = score;
      }

      const result: LeaderboardEntryProps = {
        token_id: Number(nft.token_id),
        nft_contract: nft.cde_name,  // Not really used, just send something.
        wins: nft.wins,
        draws: 0,
        losses: nft.losses,
        total_games: nft.wins + nft.losses,
        score,
        current_streak: nft.streak,
        longest_streak: nft.best_streak,

        position,
        wallet_address: nft.nft_owner ?? '',
      };

      switch (nft.cde_name) {
        case cdeName:
          result.avatar_url = `/trainer-image/${nft.token_id}.png`;
          result.name = `Tarochi Genesis Trainer #${nft.token_id}`;
          if (nft.nft_owner) {
            result.wallet_alias = generateNameFromString(nft.nft_owner);
          }
          break;
      }

      return result;
    });
  }
}
