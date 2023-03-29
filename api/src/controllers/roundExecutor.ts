import { Controller, Get, Query, Route, ValidateError } from 'tsoa';
import {
  requirePool,
  getBlockHeight,
  getLobbyById,
  getRoundData,
  getRoundMoves,
  IGetBlockHeightResult,
  IGetLobbyByIdResult,
  IGetMovesByLobbyResult,
  IGetRoundDataResult,
} from '@tower-defense/db';
import { isLeft } from 'fp-ts/Either';
import { psqlNum } from '../validation.js';
import { MatchState, Structure, TurnAction } from '@tower-defense/utils';

type Response = RoundData | Error;

interface Error {
  error: 'lobby not found' | 'bad round number' | 'round not found';
}

interface RoundData {
  lobby: IGetLobbyByIdResult;
  moves: TurnAction[];
  round_data: IGetRoundDataResult;
  block_height: IGetBlockHeightResult;
}

@Route('round_executor')
export class roundExecutorController extends Controller {
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
      const [lobby] = await getLobbyById.run({ lobby_id: lobbyID }, pool);
      if (!lobby) return { error: 'lobby not found' };
      else {
        if (!(round > 0)) return { error: 'bad round number' };
        else {
          const [round_data] = await getRoundData.run(
            { lobby_id: lobbyID, round_number: round },
            pool
          );
          if (!round_data) return { error: 'round not found' };
          else {
            const [block_height] = await getBlockHeight.run(
              { block_height: round_data.execution_block_height },
              pool
            );
            const matchState = round_data.match_state as unknown as MatchState;
            const dbMoves = await getRoundMoves.run({ lobby_id: lobbyID, round: round }, pool);
            const moves = dbMoves.map(m => moveToAction(m, matchState.attacker));
            return { lobby, round_data, moves, block_height };
          }
        }
      }
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
