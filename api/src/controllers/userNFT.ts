import { Controller, Get, Query, Route } from 'tsoa';
import type { IGetLatestUserNftResult } from '@tower-defense/db';
import { requirePool, getLatestUserNft } from '@tower-defense/db';
import { getMainAddress } from '@paima/db';

interface UserNftResponse {
  nft: IGetLatestUserNftResult;
}

@Route('user_nft')
export class userNFTController extends Controller {
  @Get()
  public async get(@Query() wallet: string): Promise<UserNftResponse> {
    const pool = requirePool();
    wallet = (await getMainAddress(wallet, pool)).address;
    const [nft] = await getLatestUserNft.run({ wallet }, pool);
    return { nft };
  }
}
