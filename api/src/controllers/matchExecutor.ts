import { Controller, Get, Query, Route } from 'tsoa';
import type { IGetMovesByLobbyResult } from '@tower-defense/db';
import { requirePool, getLobbyById, getMatchSeeds, getMovesByLobby } from '@tower-defense/db';
import type { MatchExecutorData, MatchState, Structure, TurnAction } from '@tower-defense/utils';

type Response = MatchExecutorData | null;

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
      const initialState = rounds.find(r => r.round_within_match === 1)
        ?.match_state as unknown as MatchState;
      const dbMoves = await getMovesByLobby.run({ lobby_id: lobbyID }, pool);
      const moves = dbMoves.map(m => moveToAction(m, initialState.attacker));
      return { lobby, seeds, initialState, moves };
    }
  }
}

function moveToAction(m: IGetMovesByLobbyResult, attacker: string): TurnAction {
  if (m.move_type === 'build') {
    const [structure, coordinates] = m.move_target.split('--');
    return {
      round: m.round,
      action: m.move_type,
      faction: m.wallet === attacker ? 'attacker' : 'defender',
      structure: structure as Structure,
      coordinates: parseInt(coordinates),
    };
  } else {
    return {
      round: m.round,
      action: m.move_type,
      faction: m.wallet === attacker ? 'attacker' : 'defender',
      id: parseInt(m.move_target),
    };
  }
}
