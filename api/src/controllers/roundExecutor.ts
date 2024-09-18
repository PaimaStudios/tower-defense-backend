import { Controller, Get, Query, Route, ValidateError } from 'tsoa';
import {
  requirePool,
  getBlockHeight,
  getLobbyById,
  getRoundData,
  getRoundMoves,
  getMatchConfig,
} from '@tower-defense/db';
import { isLeft } from 'fp-ts/Either';
import { psqlNum } from '../validation.js';
import type { MatchState, RoundExecutorData } from '@tower-defense/utils';
import { moveToAction } from '@tower-defense/utils';

type RoundExecutorResponse = RoundExecutorData | RoundExecutorError;

interface RoundExecutorError {
  error: 'lobby not found' | 'bad round number' | 'round not found';
}

@Route('round_executor')
export class roundExecutorController extends Controller {
  @Get()
  public async get(@Query() lobbyID: string, @Query() round: number): Promise<RoundExecutorResponse> {
    const pool = requirePool();
    const valRound = psqlNum.decode(round);
    if (isLeft(valRound)) {
      throw new ValidateError({ round: { message: 'invalid number' } }, '');
    } else {
      const [lobby] = await getLobbyById.run({ lobby_id: lobbyID }, pool);
      const [config] = await getMatchConfig.run({ id: lobby.config_id }, pool);
      const configString = config.content;
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
            const moves = dbMoves.map(move => moveToAction(move, matchState.attacker));
            return { lobby, configString, round_data, moves, block_height };
          }
        }
      }
    }
  }
}
