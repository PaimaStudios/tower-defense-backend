import { getOwnedNfts } from '@paima/utils-backend';
import { requirePool } from '@tower-defense/db';
import { Controller, Get, Query, Route } from 'tsoa';
import { cdeName, getContractAddress, getNftMetadata } from '@tower-defense/utils';
import { getMainAddress, getRelatedWallets } from '@paima/db';

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
    account = (await getMainAddress(account, pool)).address;

    const related = await getRelatedWallets(account, pool);
    const allAddresses = [
      ...related.from.map(x => x.to_address),
      account,
      ...related.to.map(x => x.from_address),
    ];

    let tokenIds = (await Promise.all(allAddresses.map(x => getOwnedNfts(pool, cdeName, x))))
      .flat()
      .sort();

    const totalItems = tokenIds.length,
      pages = Math.ceil(totalItems / size);
    tokenIds = tokenIds.slice(page * size, (page + 1) * size);

    return {
      response: {
        pages,
        totalItems,
        result: tokenIds.map(id => ({
          metadata: getNftMetadata(id),
          contract: getContractAddress(),
          tokenId: Number(id),
        })),
      },
    };
  }
}
