import { Controller, Get, Query, Route } from 'tsoa';

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
    return {
      response: {
        pages: 1,
        totalItems: 1,
        result: [
          {
            metadata: {
              name: "Foo",
              image: "/cheese.png"
            },
            contract: "0x0",
            tokenId: 1,
          }
        ],
      },
    };
  }
}
