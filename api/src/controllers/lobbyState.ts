import { Body, Controller, Get, Path, Post, Query, Route, SuccessResponse } from 'tsoa';
import {
  getLobbyById,
  getPaginatedOpenLobbies,
  getRoundData,
  IGetLobbyByIdResult,
  IGetPaginatedOpenLobbiesResult,
  requirePool,
} from '@tower-defense/db';

interface Response {
  lobby: Lobby | null;
}

interface Lobby extends IGetLobbyByIdResult {
  player_states?: IGetLobbyByIdResult;
  next_round_in?: { seconds: number; calculated_at: number };
  round_start_height: number;
}

@Route('lobby_state')
export class lobbyStatecontroller extends Controller {
  @Get()
  public async get(@Query() lobbyID: string): Promise<Response> {
    const pool = requirePool();
    const [lobby] = await getLobbyById.run({ lobby_id: lobbyID }, pool);
    if (!lobby) return { lobby: null };
    else {
      const [round_data] = await getRoundData.run(
        { lobby_id: lobbyID, round_number: lobby.current_round },
        pool
      );
      const startingBlockheight = round_data?.starting_block_height || 0;
      if (lobby.lobby_state === 'open') {
        const nextRound = {
          seconds: lobby.round_length * 4, // db holds the blockheight
          calculated_at: Date.now(),
        };
        const response = {
          ...lobby,
          ...{ next_round_in: nextRound, round_start_height: startingBlockheight },
        };
        return { lobby: response };
      } else {
        const response = {
          ...lobby,
          round_start_height: startingBlockheight,
        };
        return { lobby: response };
      }
    }
  }
}
