import { Controller, Get, Query, Route, ValidateError } from 'tsoa';
import { requirePool } from '@tower-defense/db';
import { psqlNum } from '../validation';
import { isLeft } from 'fp-ts/lib/Either';
import { addCreatorNfts } from '../utils';
import { LobbyWebserverQuery } from '@tower-defense/utils';
import { getOpenLobbyById, searchPaginatedOpenLobbies } from './mockDB';

interface SearchOpenLobbiesResponse {
  lobbies: LobbyWebserverQuery[];
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

    wallet = wallet.toLowerCase();

    if (searchQuery.length == LOBBY_ID_LENGTH) {
      const dbLobbies = await getOpenLobbyById.run({ searchQuery, wallet }, pool);
      const lobbies = await addCreatorNfts(dbLobbies, pool);
      return { lobbies };
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
    const dbLobbies = await searchPaginatedOpenLobbies.run(
      { count: `${c}`, page: `${offset}`, searchQuery: `%${searchQuery}%`, wallet },
      pool
    );
    const lobbies = await addCreatorNfts(dbLobbies, pool);
    return { lobbies };
  }
}
