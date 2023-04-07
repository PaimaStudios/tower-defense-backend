import processTick, { parseConfig } from '@tower-defense/game-logic';
import type {
  MatchConfig,
  MatchExecutorData,
  MatchState,
  RoundExecutorData,
  TickEvent,
} from '@tower-defense/utils';
import type { MatchExecutor, RoundExecutor } from 'paima-engine/paima-executors';
import {
  matchExecutor as matchExecutorConstructor,
  roundExecutor as roundExecutorConstructor,
} from 'paima-engine/paima-executors';
import { pushLog } from 'paima-engine/paima-mw-core';
import Prando from 'paima-engine/paima-prando';

// executor
export async function buildRoundExecutor(
  data: RoundExecutorData
): Promise<RoundExecutor<MatchState, TickEvent>> {
  console.log(data, 'data');
  const { seed } = data.block_height;
  pushLog(seed, 'seed used for the round executor at the middleware');
  const matchConfig: MatchConfig = parseConfig(data.configString);
  const matchState = data.round_data.match_state as unknown as MatchState;
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

export async function buildMatchExecutor(
  data: MatchExecutorData
): Promise<MatchExecutor<MatchState, TickEvent>> {
  const { lobby, seeds, initialState, moves } = data;
  console.log(data, 'data');
  const matchConfig: MatchConfig = parseConfig(data.configString);
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
