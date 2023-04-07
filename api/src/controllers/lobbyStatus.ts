import { Body, Controller, Get, Path, Post, Query, Route, SuccessResponse } from 'tsoa';
import {
  getLobbyById,
  getLobbyStatus,
  getPaginatedOpenLobbies,
  getRoundData,
  IGetLobbyByIdResult,
  IGetPaginatedOpenLobbiesResult,
  requirePool,
} from '@tower-defense/db';
import type { LobbyStatus } from '@tower-defense/utils';

interface Response {
  lobbyStatus: LobbyStatus | null;
}

@Route('lobby_status')
export class lobbyStatusController extends Controller {
  @Get()
  public async get(@Query() lobbyID: string): Promise<Response> {
    const pool = requirePool();
    const [lobbyStatus] = await getLobbyStatus.run({ lobby_id: lobbyID }, pool);
    if (!lobbyStatus) return { lobbyStatus: null };
    else return { lobbyStatus: lobbyStatus.lobby_state };
  }
}
