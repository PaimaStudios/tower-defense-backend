import { requirePool } from '@tower-defense/db';
import { Controller, Get, Query, Route } from 'tsoa';
import { getMainAddress, getRelatedWallets } from '@paima/db';

interface AccountData {
  currentConnections: number;
}

@Route('account')
export class AccountController extends Controller {
  @Get()
  public async get(
    @Query() account: string,
  ): Promise<{ response: AccountData }> {
    const pool = requirePool();
    account = (await getMainAddress(account, pool)).address;

    const related = await getRelatedWallets(account, pool);
    const allAddresses = [
      ...related.from.map(x => x.to_address),
      account,
      ...related.to.map(x => x.from_address),
    ];

    return {
      response: {
        currentConnections: allAddresses.length - 1,
      }
    };
  }
}
