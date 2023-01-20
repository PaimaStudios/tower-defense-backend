import { Controller, Get, Query, Route, ValidateError } from 'tsoa';
import { requirePool } from '@tower-defense/db';
import { isLeft } from 'fp-ts/Either';
import { psqlNum } from '../validation.js';
import { LobbyWebserverQuery } from '@tower-defense/utils';
import { getPaginatedOpenLobbies } from './mockDB.js';
import { addCreatorNfts } from '../utils.js';

interface OpenLobbiesResponse {
  lobbies: LobbyWebserverQuery[];
}

@Route('open_lobbies')
export class openLobbiesController extends Controller {
  @Get()
  public async get(
    @Query() wallet: string,
    @Query() count?: number,
    @Query() page?: number
  ): Promise<OpenLobbiesResponse> {
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

    wallet = wallet.toLowerCase();
    const p = valPage.right;
    const c = valCount.right;
    const offset = (p - 1) * c;
    const dbLobbies = await getPaginatedOpenLobbies.run(
      { count: `${c}`, page: `${offset}`, wallet },
      pool
    ); // pgtyped keeps getting types wrong
    const lobbies = await addCreatorNfts(dbLobbies, pool);
    return { lobbies };
  }
}
