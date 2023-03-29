import processTick, { parseConfig } from '@tower-defense/game-logic';
import type { MatchConfig, MatchState } from '@tower-defense/utils';
import {
  MatchExecutor,
  matchExecutor as matchExecutorConstructor,
  RoundExecutor,
  roundExecutor as roundExecutorConstructor,
} from 'paima-engine/paima-executors';
import { pushLog } from 'paima-engine/paima-mw-core';
import Prando from 'paima-engine/paima-prando';

import type { MatchExecutorData, RoundExecutorData } from '../types';

// executor
export async function buildRoundExecutor(data: RoundExecutorData): Promise<RoundExecutor> {
  console.log(data, 'data');
  const { seed } = data.block_height;
  pushLog(seed, 'seed used for the round executor at the middleware');
  const matchConfig: MatchConfig = parseConfig(data.lobby.config_id);
  const matchState = data.round_data.match_state;
  const rng = new Prando(seed);
  const executor = roundExecutorConstructor.initialize(
    matchConfig,
    matchState,
    data.moves,
    rng,
    processTick
  );
  //TODO: check with santiago
  //@ts-ignore
  return { ...executor, altCurrentState: newActors(executor.currentState) };
  // return executor
}

function newActors(m: MatchState): any {
  return {
    ...m,
    actors: {
      units: Object.values(m.actors.units),
      crypts: Object.values(m.actors.crypts),
      towers: Object.values(m.actors.towers),
    },
  };
}

export async function buildMatchExecutor(data: MatchExecutorData): Promise<MatchExecutor> {
  const { lobby, seeds, initialState, moves } = data;
  console.log(data, 'data');
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
