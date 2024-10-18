import { Controller, Get, Query, Route } from 'tsoa';

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
    return {
      success: false,
    };
  }
}
