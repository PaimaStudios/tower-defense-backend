import { Controller, Get, Query, Route } from 'tsoa';

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
  public async get(
    @Query() contract: string,
    @Query() tokenId: number,
  ): Promise<TitleImage> {
    console.log('title-image', contract, tokenId);
    return {
      success: false,
    };
  }
}
