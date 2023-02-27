import { Controller, Get, Query, Route, ValidateError } from 'tsoa';
import { requirePool, getLobbyById, getRoundData, getRoundMoves } from '@tower-defense/db';
import { isLeft } from 'fp-ts/Either';
import { psqlNum } from '../validation.js';

type Response = RoundData | Error;
type Wallet = string;

interface RoundData {
  round: {
    executed: boolean;
    usersWhoSubmittedMoves: Wallet[];
    roundStarted: number; // blockheight
    roundLength: number;
  };
}

interface Error {
  error: 'round not found' | 'lobby not found';
}

@Route('round_status')
export class roundStatusController extends Controller {
  @Get()
  public async get(@Query() lobbyID: string, @Query() round: number): Promise<Response> {
    const pool = requirePool();
    const valRound = psqlNum.decode(round);
    if (isLeft(valRound))
      throw new ValidateError(
        {
          round: {
            message: 'invalid number',
          },
        },
        ''
      );
    else {
      const moves = await getRoundMoves.run({ lobby_id: lobbyID, round: round }, pool);
      const ids = moves.map(m => m.wallet);
      const [roundData] = await getRoundData.run({ lobby_id: lobbyID, round_number: round }, pool);
      const [lobby] = await getLobbyById.run({ lobby_id: lobbyID }, pool);
      if (!lobby || !roundData) return { error: 'lobby not found' };
      else {
        const ret = {
          executed: !!roundData.execution_block_height,
          usersWhoSubmittedMoves: Array.from(new Set(ids)),
          roundStarted: roundData.starting_block_height,
          roundLength: lobby.round_length,
        };
        return { round: ret };
      }
    }
  }
}
