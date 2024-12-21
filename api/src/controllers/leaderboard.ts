import { getNftLeaderboards, getNftLeaderboardsWeek, requirePool } from '@tower-defense/db';
import { Controller, Get, Query, Route } from 'tsoa';
import {
  CDE_CARDANO_GENESIS_TRAINER,
  CDE_EVM_GENESIS_TRAINER,
  generateNameFromString,
  iso8601YearAndWeek,
  CDE_XAI_SENTRY_KEY,
  getNftMetadata,
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

interface LeaderboardResult {
  week?: {
    start: Date,
    end: Date,
  },
  entries: LeaderboardEntryProps[],
}

@Route('leaderboards')
export class LeaderboardsController extends Controller {
  @Get()
  public async get(
    @Query() frequency: string,
    @Query() previous: boolean
  ): Promise<LeaderboardResult> {
    const pool = requirePool();

    const date = new Date();
    const week = iso8601YearAndWeek(date);
    date.setUTCDate(date.getUTCDate() - 7);
    const lastWeek = iso8601YearAndWeek(date);

    let nfts, weekData;
    switch (frequency) {
      case 'global':
      case 'streak':
        nfts = await getNftLeaderboards.run(undefined, pool);
        break;
      case 'weekly-genesis-trainer':
        weekData = previous ? lastWeek : week;
        nfts = await getNftLeaderboardsWeek.run({ week: previous ? lastWeek.str : week.str, cde: [CDE_EVM_GENESIS_TRAINER, CDE_CARDANO_GENESIS_TRAINER] }, pool);
        break;
      case 'weekly-xai-sentry':
        weekData = previous ? lastWeek : week;
        nfts = await getNftLeaderboardsWeek.run({ week: previous ? lastWeek.str : week.str, cde: [CDE_XAI_SENTRY_KEY] }, pool);
        break;
      default:
        return { entries: [] };
    }

    let [position, position_score] = [0, Infinity];
    const entries = nfts.map((nft, index) => {
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

      const meta = getNftMetadata(nft.cde_name, Number(nft.token_id));
      if (meta) {
        result.avatar_url = meta.image;
        result.name = meta.name;
      }
      if (nft.nft_owner) {
        result.wallet_alias = generateNameFromString(nft.nft_owner);
      }

      return result;
    });
    return { week: weekData, entries };
  }
}
