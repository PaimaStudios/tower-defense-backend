import { getOwnedNfts } from '@paima/utils-backend';
import { getCardanoGenesisTrainersByOwner, requirePool } from '@tower-defense/db';
import { Controller, Get, Query, Route } from 'tsoa';
import { CDE_CARDANO_GENESIS_TRAINER, CDE_EVM_GENESIS_TRAINER, getNftMetadata, SyntheticContractAddress } from '@tower-defense/utils';
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

    let evmTokenIds = (await Promise.all(allAddresses.map(x => getOwnedNfts(pool, CDE_EVM_GENESIS_TRAINER, x))))
      .flat()
      .sort();

    let cardanoTokens = await getCardanoGenesisTrainersByOwner.run({ owners: allAddresses }, pool);

    let result = [
      ...evmTokenIds.map(id => ({
        metadata: getNftMetadata(CDE_EVM_GENESIS_TRAINER, id),
        contract: SyntheticContractAddress.EVM_GENESIS_TRAINER,
        tokenId: Number(id),
      })),
      ...cardanoTokens.map(row => ({
        metadata: getNftMetadata(CDE_CARDANO_GENESIS_TRAINER, row.token_id),
        contract: SyntheticContractAddress.CARDANO_GENESIS_TRAINER,
        tokenId: Number(row.token_id),
      })),
    ];

    const totalItems = result.length,
      pages = Math.ceil(totalItems / size);
    result = result.slice(page * size, (page + 1) * size);

    return {
      response: {
        pages,
        totalItems,
        result,
      },
    };
  }
}
