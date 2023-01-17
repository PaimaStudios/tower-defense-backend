import {
  Body,
  Controller,
  Get,
  Path,
  Post,
  Query,
  Route,
  SuccessResponse,
  ValidateError,
} from 'tsoa';
import {
  requirePool,
  getBlockHeight,
  getLobbyById,
  getRoundData,
  getRoundMoves,
  getUserStatesByRound,
  IGetAllMatchStatesResult,
  IGetBlockHeightResult,
  IGetLobbyByIdResult,
  IGetMovesByLobbyResult,
  IGetRoundDataResult,
} from '@catapult/db';
import { isLeft } from 'fp-ts/Either';
import { psqlNum } from '../validation.js';

type Response = RoundData | Error;

interface Error {
  error: 'lobby not found' | 'bad round number' | 'round not found';
}

interface RoundData {
  lobby: IGetLobbyByIdResult;
  states: IGetAllMatchStatesResult[];
  moves: IGetMovesByLobbyResult[];
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
          const states = await getUserStatesByRound.run({ lobby_id: lobbyID, round: round }, pool);
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
            const moves = await getRoundMoves.run({ lobby_id: lobbyID, round: round }, pool);
            return { lobby, states, round_data, moves, block_height };
          }
        }
      }
    }
  }
}
