import { Controller, Get, Query, Route } from 'tsoa';

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
  public async get(
    @Query() nft_contract: string,
    @Query() token_id: number
  ): Promise<NftScore> {
    console.log('nft-score', nft_contract, token_id);
    return {
      data: {
        nft_contract,
        token_id,
        total_games: 1,
        wins: 17,
        losses: 21,
        draws: 37,
        score: 9001,
      }
    };
  }
}
