import { Controller, Get, Query, Route } from 'tsoa';
import { requirePool } from '@tower-defense/db';
import { getLatestUserNft, IGetUserNfTsResult } from './mockDB';

interface Response {
  nft: IGetUserNfTsResult;
}

@Route('user_nft')
export class userNFTController extends Controller {
  @Get()
  public async get(@Query() wallet: string): Promise<Response> {
    const pool = requirePool();
    wallet = wallet.toLowerCase();
    const [nft] = await getLatestUserNft.run({ wallet }, pool);
    return { nft };
  }
}
