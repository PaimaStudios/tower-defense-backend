import { Controller, Get, Query, Route, ValidateError } from 'tsoa';
import type { ISearchPaginatedOpenLobbiesResult } from '@tower-defense/db';
import { requirePool, searchPaginatedOpenLobbies, getOpenLobbyById } from '@tower-defense/db';
import { psqlNum } from '../validation.js';
import { isLeft } from 'fp-ts/lib/Either.js';
import { getMainAddress } from '@paima/db';

interface SearchOpenLobbiesResponse {
  lobbies: ISearchPaginatedOpenLobbiesResult[];
}

const MIN_SEARCH_LENGTH = 3;
const LOBBY_ID_LENGTH = 12;

@Route('search_open_lobbies')
export class SearchOpenLobbiesController extends Controller {
  @Get()
  public async get(
    @Query() wallet: string,
    @Query() searchQuery: string,
    @Query() page?: number,
    @Query() count?: number
  ): Promise<SearchOpenLobbiesResponse> {
    const pool = requirePool();
    const emptyResponse = { lobbies: [] };
    if (searchQuery.length < MIN_SEARCH_LENGTH || searchQuery.length > LOBBY_ID_LENGTH)
      return emptyResponse;

    //wallet = (await getMainAddress(wallet, pool)).address;

    if (searchQuery.length == LOBBY_ID_LENGTH) {
      const lobbies = await getOpenLobbyById.run({ searchQuery, wallet }, pool);
      // The frontend logic requires pagination in all cases, so let this hack
      // work to stop endless spinners
      if (!page || page === 1) return { lobbies };
      else return { lobbies: [] };
    }

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

    const c = valCount.right;
    const offset = (valPage.right - 1) * c;
    const lobbies = await searchPaginatedOpenLobbies.run(
      { count: `${c}`, page: `${offset}`, searchQuery: `%${searchQuery}%`, wallet },
      pool
    );
    return { lobbies };
  }
}
