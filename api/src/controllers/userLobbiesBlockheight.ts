import { Controller, Get, Query, Route, ValidateError } from 'tsoa';
import type { IGetNewLobbiesByUserAndBlockHeightResult } from '@tower-defense/db';
import { requirePool, getNewLobbiesByUserAndBlockHeight } from '@tower-defense/db';
import { psqlNum } from '../validation.js';
import { isLeft } from 'fp-ts/Either';

interface Response {
  lobbies: IGetNewLobbiesByUserAndBlockHeightResult[];
}

@Route('user_lobbies_blockheight')
export class UserLobbiesBlockheightController extends Controller {
  @Get()
  public async get(@Query() wallet: string, @Query() blockHeight: number): Promise<Response> {
    const pool = requirePool();
    wallet = wallet.toLowerCase();
    const valBH = psqlNum.decode(blockHeight);
    if (isLeft(valBH)) {
      throw new ValidateError({ blockHeight: { message: 'invalid number' } }, '');
    }

    const lobbies = await getNewLobbiesByUserAndBlockHeight.run(
      { wallet: wallet, block_height: blockHeight },
      pool
    );
    return { lobbies };
  }
}
