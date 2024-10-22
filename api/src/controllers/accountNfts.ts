import { getOwnedNfts } from '@paima/utils-backend';
import { requirePool } from '@tower-defense/db';
import { Controller, Get, Query, Route } from 'tsoa';
import { getNftMetadata } from '../genesisTrainer.js';

// TODO: un-hardcode contract address.
const contract = '0xe7f1725e7734ce288f8367e1bb143e90bb3f0512';

interface AccountNftsResult {
  metadata: {
    name: string;
    image: string;
  };
  contract: string;
  tokenId: number;
}

interface AccountNftsData {
  pages: number;
  totalItems: number;
  result: AccountNftsResult[];
}

@Route('account-nfts')
export class AccountNftsController extends Controller {
  @Get()
  public async get(
    @Query() account: string,
    @Query() page: number,
    @Query() size: number
  ): Promise<{ response: AccountNftsData }> {
    console.log('account-nfts', account, page, size);

    const pool = requirePool();
    let tokenIds = await getOwnedNfts(pool, 'EVM Genesis Trainer', account);
    const totalItems = tokenIds.length, pages = Math.ceil(totalItems / size);
    tokenIds = tokenIds.slice(page * size, (page + 1) * size);

    return {
      response: {
        pages,
        totalItems,
        result: tokenIds.map(id => ({
          metadata: getNftMetadata(id),
          contract,
          tokenId: Number(id),
        })),
      },
    };
  }
}
