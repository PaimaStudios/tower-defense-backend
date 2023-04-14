import { Controller, Get, Query, Route } from 'tsoa';
import {
  requirePool,
  getLobbyById,
  getMatchSeeds,
  getMovesByLobby,
  getMatchConfig,
} from '@tower-defense/db';
import type { MatchExecutorData, MatchState } from '@tower-defense/utils';
import { moveToAction } from '@tower-defense/utils';

type Response = MatchExecutorData | null;

@Route('match_executor')
export class matchExecutorController extends Controller {
  @Get()
  public async get(@Query() lobbyID: string): Promise<Response> {
    const pool = requirePool();
    const [lobby] = await getLobbyById.run({ lobby_id: lobbyID }, pool);
    const [config] = await getMatchConfig.run({ id: lobby.config_id }, pool);
    const configString = config.content;
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
      const initialState = rounds.find(r => r.round_within_match === 1)
        ?.match_state as unknown as MatchState;
      const dbMoves = await getMovesByLobby.run({ lobby_id: lobbyID }, pool);
      const moves = dbMoves.map(m => moveToAction(m, initialState.attacker));
      return { lobby, configString, seeds, initialState, moves };
    }
  }
}
