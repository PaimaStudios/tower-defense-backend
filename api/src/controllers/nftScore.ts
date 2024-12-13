import { getNftScore, requirePool } from '@tower-defense/db';
import { Controller, Get, Query, Route } from 'tsoa';
import { synthAddressToCdeName } from '@tower-defense/utils';

interface NftScore {
  data: {
    nft_contract: string;
    token_id: number;
    total_games: number;
    wins: number;
    draws: number;
    losses: number;
    score: number;
  };
}

@Route('nft-score')
export class NftScoreController extends Controller {
  @Get()
  public async get(@Query() nft_contract: string, @Query() token_id: number): Promise<NftScore> {
    console.log('nft-score', nft_contract, token_id);

    const cde_name = synthAddressToCdeName(nft_contract);

    const pool = requirePool();
    const rows = await getNftScore.run({ cde_name, token_id: String(token_id) }, pool);
    const { wins, losses } = rows.length > 0 ? rows[0] : { wins: 0, losses: 0 };

    return {
      data: {
        nft_contract,
        token_id,
        wins,
        losses,
        // These are not shown in the frontend, except for a sanity check that
        // totalGames must be equal to wins + losses + draws.
        total_games: wins + losses,
        draws: 0,
        score: 5 * wins - 4 * losses,
      },
    };
  }
}
