import { Controller, Get, Query, Route } from 'tsoa';
import { getNftMetadata } from '../genesisTrainer.js';

type TitleImage =
  | {
      success: true;
      result: {
        title: string;
        image: string;
      };
    }
  | { success: false };

@Route('title-image')
export class TitleImageController extends Controller {
  @Get()
  public async get(@Query() contract: string, @Query() tokenId: number): Promise<TitleImage> {
    console.log('title-image', contract, tokenId);
    // TODO: verify contract == what we expect.
    const m = getNftMetadata(tokenId);
    return {
      success: true,
      result: {
        title: m.name,
        image: m.image,
      },
    };
  }
}
