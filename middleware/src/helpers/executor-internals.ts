import processTick, { parseConfig } from '@tower-defense/game-logic';
import { MatchConfig } from '@tower-defense/utils';
import {
  MatchExecutor as MatchExecutorConstructor,
  RoundExecutor as RoundExecutorConstructor,
} from 'paima-engine/paima-executors';
import Prando from 'paima-engine/paima-prando';

import {
  ExecutorDataPlayerState,
  ExecutorDataSeed,
  MatchExecutor,
  MatchExecutorData,
  PlayerStatePair,
  RoundExecutor,
  RoundExecutorData,
} from '../types';
import { pushLog } from './logging';

// executor

export async function buildRoundExecutor(data: RoundExecutorData): Promise<RoundExecutor> {
  const { seed } = data.block_height;
  pushLog(seed, 'seed used for the round executor at the middleware');
  const matchConfig: MatchConfig = parseConfig(data.config);
  const matchState = data.state;
  const rng = new Prando(seed);
  return RoundExecutorConstructor.initialize(matchConfig, matchState, data.moves, rng, processTick);
}

export async function buildMatchExecutor(data: MatchExecutorData): Promise<MatchExecutor> {
  // const { lobby, states, seeds, moves } = data;
  // const matchEnvironment = { gridSize: lobby.grid_size };
  // pushLog(seeds, 'seeds used for the match executor at the middleware');
  // const roundMoves: ExecutorMove[][] = moves.reduce((acc: ExecutorMove[][], move: ExecutorMove) => {
  //   const index = move.round - 1;
  //   const roundMoves = acc[index] ? [...acc[index], move] : [move];
  //   acc[index] = roundMoves;
  //   return acc;
  // }, []);
  // const sortedRoundMoves: ExecutorMove[][] = roundMoves.map(
  //   (oneRoundMoves: ExecutorMove[], i: number) => {
  //     const seedObj = seeds.find((s: ExecutorDataSeed) => s.round === i + 1);
  //     if (typeof seedObj === 'undefined') {
  //       throw new Error(`No seed for round ${i + 1}`);
  //     }
  //     const rng = new Prando(seedObj.seed);
  //     return sortRoundMoves(oneRoundMoves, rng);
  //   }
  // );
  // const sortedMoves: ExecutorMove[] = sortedRoundMoves.flat();
  // return MatchExecutorConstructor.initialize(
  //   matchEnvironment,
  //   lobby.num_of_rounds,
  //   states,
  //   seeds,
  //   sortedMoves,
  //   parseStates,
  //   processTick
  // );
}
