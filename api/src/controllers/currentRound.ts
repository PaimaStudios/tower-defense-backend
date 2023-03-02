import { Controller, Get, Query, Route } from 'tsoa';
import { requirePool, getLobbyById, getRoundData } from '@tower-defense/db';

type Response = RoundData | Error;

interface RoundData {
  currentRound: number;
  roundStartHeight: number;
}

interface Error {
  error: 'round not found' | 'lobby not found';
}

@Route('current_round')
export class currentRoundController extends Controller {
  @Get()
  public async get(@Query() lobbyID: string): Promise<Response> {
    const pool = requirePool();
    console.log(lobbyID, "querying")
    const [lobby] = await getLobbyById.run({ lobby_id: lobbyID }, pool);
    const [roundData] = await getRoundData.run(
      { lobby_id: lobbyID, round_number: lobby.current_round },
      pool
    );
    if (!lobby || !roundData) return { error: 'lobby not found' };
    else {
      const currentRound = lobby.current_round;
      const roundStartHeight = roundData.starting_block_height;
      return { currentRound, roundStartHeight };
    }
  }
}
