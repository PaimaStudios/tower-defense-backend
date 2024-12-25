import { Controller, Get, Query, Route } from 'tsoa';
import { getNftMetadata, synthAddressToCdeName } from '@tower-defense/utils';

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
    const m = getNftMetadata(synthAddressToCdeName(contract), tokenId);
    return {
      success: true,
      result: {
        title: m.name,
        image: m.image,
      },
    };
  }
}
