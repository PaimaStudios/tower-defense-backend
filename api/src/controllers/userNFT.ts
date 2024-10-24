import { Controller, Get, Query, Route } from 'tsoa';
import type { IGetLatestUserNftResult } from '@tower-defense/db';
import { requirePool, getLatestUserNft } from '@tower-defense/db';

interface UserNftResponse {
  nft: IGetLatestUserNftResult;
}

@Route('user_nft')
export class userNFTController extends Controller {
  @Get()
  public async get(@Query() wallet: string): Promise<UserNftResponse> {
    const pool = requirePool();
    wallet = wallet.toLowerCase();
    const [nft] = await getLatestUserNft.run({ wallet }, pool);
    return { nft };
  }
}
