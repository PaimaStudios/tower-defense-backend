import { Controller, Get, Query, Route } from 'tsoa';
import { getNftOwner } from '@paima/utils-backend';
import { requirePool } from '@tower-defense/db';
import { cdeName } from '../genesisTrainer';

type HistoricalOwner =
  | {
      success: true;
      result: string;
    }
  | { success: false };

@Route('historical-owner')
export class HistoricalOwnerController extends Controller {
  @Get()
  public async get(
    @Query() contract: string,
    @Query() tokenId: number,
    @Query() blockHeight: number
  ): Promise<HistoricalOwner> {
    console.log('historical-owner', contract, tokenId, blockHeight);

    // NOTE: This is not a REAL historical owner endpoint! Block height is ignored!
    // This is fine for now because the frontend only asks about the current state anyways.
    // TODO: It also currently ignores the contract address.

    const pool = requirePool();
    const value = await getNftOwner(pool, cdeName, BigInt(tokenId));

    return value
      ? {
          success: true,
          result: value,
        }
      : { success: false };
  }
}
