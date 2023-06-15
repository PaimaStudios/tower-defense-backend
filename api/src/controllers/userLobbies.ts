import { Controller, Get, Query, Route, ValidateError } from 'tsoa';
import type { IGetPaginatedUserLobbiesResult } from '@tower-defense/db';
import { getRoundData } from '@tower-defense/db';
import { requirePool, getPaginatedUserLobbies, getRoundMoves } from '@tower-defense/db';
import { isLeft } from 'fp-ts/Either';
import { psqlNum } from '../validation.js';

interface Response {
  lobbies: UserLobby[];
}

interface UserLobby extends IGetPaginatedUserLobbiesResult {
  myTurn?: boolean;
}

@Route('user_lobbies')
export class UserLobbiesController extends Controller {
  @Get()
  public async get(
    @Query() wallet: string,
    @Query() count?: number,
    @Query() page?: number
  ): Promise<Response> {
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
    const userLobbies = await getPaginatedUserLobbies.run(
      { wallet: wallet, count: `${c}`, page: `${offset}` },
      pool
    );
    const addedWaitStatus = userLobbies.map(async l => {
      if (l.lobby_state === 'active') {
        const moves = await getRoundMoves.run(
          { lobby_id: l.lobby_id, round: l.current_round },
          pool
        );
        const ids = moves.map(m => m.wallet);
        const myTurn = !ids.includes(wallet);
        const [roundData] = await getRoundData.run(
          { lobby_id: l.lobby_id, round_number: l.current_round },
          pool
        );
        const round_start_height = !roundData ? null : roundData.starting_block_height;
        return { ...l, myTurn, round_start_height };
      } else return l;
    });
    const lobbies = await Promise.all(addedWaitStatus);
    return { lobbies };
  }
}
('1111111111111222222222\r\n1111111111111222222222\r\n1155511115551222222222\r\n1551555155155226262222\r\n1551111111111222222222\r\n1511115551115666266662\r\n3511111111111222222264\r\n1511115551115666266662\r\n1551555155155226262222\r\n1151511115151226662222\r\n1155511115551222222222\r\n1111111111111222222222\r\n1111111111111222222222');
