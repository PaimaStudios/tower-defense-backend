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
  public async get(@Request() request: ExpressRequest, @Query() frequency: string, @Query() previous: boolean): Promise<LeaderboardEntryProps[]> {
    console.log('/leaderboard', frequency, previous);
    const pool = requirePool();

    const nfts = await getNftLeaderboards.run(undefined, pool);
    return nfts.map((nft, index) => {
      return {
        token_id: Number(nft.token_id),
        nft_contract: 'TODO',
        wins: nft.wins,
        draws: 0,
        losses: nft.losses,
        total_games: nft.wins + nft.losses,
        score: nft.wins * 10,  // TODO
        current_streak: 17,  // TODO
        longest_streak: 21,  // TODO

        position: index + 1,  // TODO: ties
        avatar_url: `/trainer-image/${nft.token_id}.png`,
        name: 'MY NAME',
        wallet_address: nft.nft_owner,
      }
    });
  }
}
