import { Controller, Get, Query, Route } from 'tsoa';
import type { IGetUserConfigsResult } from '@tower-defense/db';
import { getUserConfigs } from '@tower-defense/db';
import { requirePool } from '@tower-defense/db';
import { getMainAddress } from '@paima/db';

interface UserConfigsResponse {
  configs: IGetUserConfigsResult[];
}

@Route('user_configs')
export class userConfigsController extends Controller {
  @Get()
  public async get(@Query() creator: string): Promise<UserConfigsResponse> {
    const pool = requirePool();
    //creator = (await getMainAddress(creator, pool)).address;
    const configs = await getUserConfigs.run({ creator }, pool);
    return { configs };
  }
}
