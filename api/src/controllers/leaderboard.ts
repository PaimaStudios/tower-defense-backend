import { getNftLeaderboards, getNftLeaderboardsWeek, requirePool } from '@tower-defense/db';
import { Controller, Get, Query, Route } from 'tsoa';
import {
  cardanoCdeName,
  cdeName,
  generateNameFromString,
  iso8601YearAndWeek,
  xaiSentryKeyCdeName,
} from '@tower-defense/utils';
import { ENV } from '@paima/utils';

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
  public async get(
    @Query() frequency: string,
    @Query() previous: boolean
  ): Promise<LeaderboardEntryProps[]> {
    const pool = requirePool();

    const date = new Date();
    const week = iso8601YearAndWeek(date);
    date.setUTCDate(date.getUTCDate() - 7);
    const lastWeek = iso8601YearAndWeek(date);

    let nfts;
    switch (frequency) {
      case 'global':
      case 'streak':
        nfts = await getNftLeaderboards.run(undefined, pool);
        break;
      case 'weekly-genesis-trainer':
        nfts = await getNftLeaderboardsWeek.run({ week: previous ? lastWeek : week, cde: [cdeName, cardanoCdeName] }, pool);
        break;
      case 'weekly-xai-sentry':
        nfts = await getNftLeaderboardsWeek.run({ week: previous ? lastWeek : week, cde: [xaiSentryKeyCdeName] }, pool);
        break;
      default:
        return [];
    }

    let [position, position_score] = [0, Infinity];
    return nfts.map((nft, index) => {
      // Give those with the same score the same ordinal position.
      const score = nft.score ?? 0; // Calc'd in SQL for ordering purposes.
      if (score < position_score) {
        position = index + 1;
        position_score = score;
      }

      const result: LeaderboardEntryProps = {
        token_id: Number(nft.token_id),
        nft_contract: nft.cde_name, // Not really used, just send something.
        wins: nft.wins,
        draws: 0,
        losses: nft.losses,
        total_games: nft.wins + nft.losses,
        score,
        current_streak: 'streak' in nft ? nft.streak : -1,
        longest_streak: 'best_streak' in nft ? nft.best_streak : -1,

        position,
        wallet_address: nft.nft_owner ?? '',
      };

      switch (nft.cde_name) {
        case cdeName:
        case cardanoCdeName:
          result.avatar_url = `${ENV.BACKEND_URI}/trainer-image/${nft.token_id}.png`;
          result.name = `Tarochi Genesis Trainer #${nft.token_id}`;
          if (nft.nft_owner) {
            result.wallet_alias = generateNameFromString(nft.nft_owner);
          }
          break;
        case xaiSentryKeyCdeName:
          result.avatar_url = `/images/xai-square.png`;
          result.name = `Xai Sentry Key #${nft.token_id}`;
          if (nft.nft_owner) {
            result.wallet_alias = generateNameFromString(nft.nft_owner);
          }
          break;
      }

      return result;
    });
  }
}
