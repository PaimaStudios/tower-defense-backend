import { Controller, Get, Query, Route } from 'tsoa';
import { getNftOwner } from '@paima/utils-backend';
import { requirePool } from '@tower-defense/db';
import { synthAddressToCdeName } from '@tower-defense/utils';
import { getMainAddress, getRelatedWallets } from '@paima/db';

type HistoricalOwner =
  | {
      success: true;
      result: boolean;
    }
  | { success: false };

@Route('historical-owner')
export class HistoricalOwnerController extends Controller {
  @Get()
  public async get(
    @Query() contract: string,
    @Query() tokenId: number,
    @Query() blockHeight: number,
    @Query() address: string,
  ): Promise<HistoricalOwner> {
    // NOTE: This is not a REAL historical owner endpoint! Block height is ignored!
    // This is fine for now because the frontend only asks about the current state anyways.
    const pool = requirePool();

    // Do like accountNfts does and get all related addresses.
    address = (await getMainAddress(address, pool)).address;

    const related = await getRelatedWallets(address, pool);
    const allAddresses = [
      ...related.from.map(x => x.to_address),
      address,
      ...related.to.map(x => x.from_address),
    ];

    // Now check if the NFT's owner is in that list.
    const instantOwner = await getNftOwner(pool, synthAddressToCdeName(contract), BigInt(tokenId));
    const value = instantOwner != null && allAddresses.includes(instantOwner);

    return value
      ? {
          success: true,
          result: value,
        }
      : { success: false };
  }
}
