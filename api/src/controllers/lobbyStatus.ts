import { Controller, Get, Query, Route } from 'tsoa';
import { getLobbyStatus, requirePool } from '@tower-defense/db';
import type { LobbyStatus } from '@tower-defense/utils';

interface LobbyStatusResponse {
  lobbyStatus: LobbyStatus | null;
}

@Route('lobby_status')
export class lobbyStatusController extends Controller {
  @Get()
  public async get(@Query() lobbyID: string): Promise<LobbyStatusResponse> {
    const pool = requirePool();
    const [lobbyStatus] = await getLobbyStatus.run({ lobby_id: lobbyID }, pool);
    if (!lobbyStatus) return { lobbyStatus: null };
    else return { lobbyStatus: lobbyStatus.lobby_state };
  }
}
