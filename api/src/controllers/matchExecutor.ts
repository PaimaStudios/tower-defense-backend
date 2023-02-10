import { Controller, Get, Query, Route, } from 'tsoa';
import {
  requirePool,
  getLobbyById,
  getMatchSeeds,
  getMovesByLobby,
  IGetLobbyByIdResult,
  IGetMovesByLobbyResult,
} from '@tower-defense/db';

type Response = MatchData | null;

interface MatchData {
  lobby: IGetLobbyByIdResult;
  moves: IGetMovesByLobbyResult[];
  seeds: {
    seed: string;
    block_height: number;
    round: number;
  }[];
}
@Route('match_executor')
export class matchExecutorController extends Controller {
  @Get()
  public async get(@Query() lobbyID: string): Promise<Response> {
    const pool = requirePool();
    const [lobby] = await getLobbyById.run({ lobby_id: lobbyID }, pool);
    if (!lobby) return null;
    else {
      const rounds = await getMatchSeeds.run({ lobby_id: lobbyID }, pool);
      const seeds = rounds.map(r => {
        return {
          seed: r.seed,
          block_height: r.block_height,
          round: r.round_within_match,
        };
      });
      const moves = await getMovesByLobby.run({ lobby_id: lobbyID }, pool);
      return { lobby, seeds, moves };
    }
  }
}
