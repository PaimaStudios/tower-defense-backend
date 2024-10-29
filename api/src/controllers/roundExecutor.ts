import { getBlockHeights } from '@paima/db';
import {
  getLobbyById,
  getMatchConfig,
  getRoundData,
  getRoundMoves,
  requirePool,
} from '@tower-defense/db';
import type { MatchState, RoundExecutorData } from '@tower-defense/utils';
import { moveToAction } from '@tower-defense/utils';
import { isLeft } from 'fp-ts/lib/Either.js';
import { Controller, Get, Query, Route, ValidateError } from 'tsoa';
import { psqlNum } from '../validation.js';

type RoundExecutorResponse = RoundExecutorData | RoundExecutorError;

interface RoundExecutorError {
  error: 'lobby not found' | 'bad round number' | 'round not found' | 'round has no block height';
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
          else if (!round_data.execution_block_height) return { error: 'round has no block height' };
          else {
            const [block_height] = await getBlockHeights.run(
              { block_heights: [round_data.execution_block_height] },
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
