import processTick, { parseConfig } from '@tower-defense/game-logic';
import { MatchConfig } from '@tower-defense/utils';
import {
  matchExecutor as matchExecutorConstructor,
  roundExecutor as roundExecutorConstructor,
} from 'paima-engine/paima-executors';
import Prando from 'paima-engine/paima-prando';

import {
  MatchExecutor,
  MatchExecutorData,
  RoundExecutor,
  RoundExecutorData,
} from '../types';
import { pushLog } from './logging';

// executor
export async function buildRoundExecutor(data: RoundExecutorData): Promise<RoundExecutor> {
  console.log(data, "data")
  const { seed } = data.block_height;
  pushLog(seed, 'seed used for the round executor at the middleware');
  const matchConfig: MatchConfig = parseConfig(data.lobby.config_id);
  const matchState = data.round_data.match_state;
  const rng = new Prando(seed);
  return roundExecutorConstructor.initialize(matchConfig, matchState, data.moves, rng, processTick);
}

export async function buildMatchExecutor(data: MatchExecutorData): Promise<MatchExecutor> {
  const { lobby, seeds, initialState, moves } = data;
  console.log(data, "data")
  const matchConfig: MatchConfig = parseConfig(data.lobby.config_id);
  pushLog(seeds, 'seeds used for the match executor at the middleware');
  return matchExecutorConstructor.initialize(
    matchConfig,
    lobby.num_of_rounds,
    initialState,
    seeds,
    moves,
    processTick
  );
}
