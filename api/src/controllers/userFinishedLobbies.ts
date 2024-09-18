import { Controller, Get, Query, Route, ValidateError } from 'tsoa';
import type { IGetPaginatedUserLobbiesResult } from '@tower-defense/db';
import { requirePool, getUserFinishedLobbies } from '@tower-defense/db';
import { isLeft } from 'fp-ts/Either';
import { psqlNum } from '../validation.js';

interface UserFinishedLobbiesResponse {
  lobbies: IGetPaginatedUserLobbiesResult[];
}

@Route('user_finished_lobbies')
export class UserFinishedLobbiesController extends Controller {
  @Get()
  public async get(
    @Query() wallet: string,
    @Query() count?: number,
    @Query() page?: number
  ): Promise<UserFinishedLobbiesResponse> {
    const pool = requirePool();
    const valPage = psqlNum.decode(page || 1); // pass 1 if undefined (or 0)
    const valCount = psqlNum.decode(count || 10); // pass 10 if undefined (or 0)
    // io-ts output typecheck. isLeft() is invalid, isRight() is valid
    // we'll reuse TSOA's error handling logic to throw an error
    if (isLeft(valPage)) {
      throw new ValidateError({ page: { message: 'invalid number' } }, '');
    }
    if (isLeft(valCount)) {
      throw new ValidateError({ count: { message: 'invalid number' } }, '');
    }

    // after typecheck, valid data output is given in .right
    wallet = wallet.toLowerCase();
    const p = valPage.right;
    const c = valCount.right;
    const offset = (p - 1) * c;
    const userLobbies = await getUserFinishedLobbies.run(
      { wallet: wallet, count: `${c}`, page: `${offset}` },
      pool
    );
    return { lobbies: userLobbies };
  }
}
