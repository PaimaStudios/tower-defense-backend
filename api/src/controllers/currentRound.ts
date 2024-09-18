import { Controller, Get, Query, Route } from 'tsoa';
import { requirePool, getLobbyById, getRoundData } from '@tower-defense/db';

type CurrentRoundResponse = RoundData | Error;

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
  public async get(@Query() lobbyID: string): Promise<CurrentRoundResponse> {
    const pool = requirePool();
    const [lobby] = await getLobbyById.run({ lobby_id: lobbyID }, pool);
    if (!lobby) {
      return { error: 'lobby not found' };
    }

    const [roundData] = await getRoundData.run(
      { lobby_id: lobbyID, round_number: lobby.current_round },
      pool
    );
    if (!roundData) {
      return { error: 'round not found' };
    }

    const currentRound =
      lobby.lobby_state === 'finished' ? lobby.current_round + 1 : lobby.current_round;
    const roundStartHeight =
      lobby.lobby_creator === 'finished'
        ? (roundData.execution_block_height as number)
        : roundData.starting_block_height;
    return { currentRound, roundStartHeight };
  }
}
