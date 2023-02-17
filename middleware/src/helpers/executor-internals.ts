import processTick from '@tower-defense/game-logic';
import {
  MatchExecutor as MatchExecutorConstructor,
  RoundExecutor as RoundExecutorConstructor,
} from 'paima-engine/paima-executors';
import Prando from 'paima-engine/paima-prando';

import {
  ExecutorDataPlayerState,
  ExecutorMove,
  MatchExecutor,
  MatchExecutorData,
  PlayerStatePair,
  RoundExecutor,
  RoundExecutorData,
} from '../types';
import { MatchConfig, MatchState, TurnAction } from '@tower-defense/utils';
// import { baseConfig } from '../endpoints/mock-helpers';
const baseConfig = {} as any;
// executor

export async function buildRoundExecutor(data: RoundExecutorData): Promise<RoundExecutor> {
  const { seed } = data.block_height;
  const matchEnvironment: MatchConfig = baseConfig;
  const matchState = data.state;
  const rng = new Prando(seed);
  return RoundExecutorConstructor.initialize(
    matchEnvironment,
    matchState,
    data.moves,
    rng,
    processTick
  );
}
// TODO a lot
export async function buildMatchExecutor(data: MatchExecutorData): Promise<MatchExecutor> {
  const { config, states, seeds, moves } = data;
  const matchEnvironment: MatchConfig = baseConfig;
  console.log(seeds, 'seeds used for the match executor at the middleware');
  const stateMutator = (m: MatchState[]) => m[0];
  return MatchExecutorConstructor.initialize(
    matchEnvironment,
    config.num_of_rounds,
    states as any,
    seeds,
    moves,
    stateMutator as any,
    processTick
  );
}

function randomizeOrder(
  player1moves: ExecutorMove[],
  player2moves: ExecutorMove[],
  randomnessGenerator: Prando
): ExecutorMove[] {
  const index = Math.round(randomnessGenerator.next()); // this will return either 0 or 1
  const first = [player1moves[0], player2moves[0]][index];
  const second = [player1moves[0], player2moves[0]][index === 0 ? 1 : 0];
  if (!first && !second) return [];
  else
    return [
      first,
      second,
      ...randomizeOrder(player1moves.slice(1), player2moves.slice(1), randomnessGenerator),
    ];
}

function sortRoundMoves(moves: ExecutorMove[], randomnessGenerator: Prando): ExecutorMove[] {
  const players = moves.reduce((acc, item) => {
    acc.add(item.wallet);
    return acc;
  }, new Set<string>([]));
  const player1moves = moves.filter(m => m.wallet === Array.from(players)[0]);
  const player2moves = moves.filter(m => m.wallet === Array.from(players)[1]);
  const sortedMoves = randomizeOrder(player1moves, player2moves, randomnessGenerator);
  return sortedMoves.filter(m => m !== undefined);
}

// TODO type this argument
function parseStates(states: ExecutorDataPlayerState[]): PlayerStatePair {
  const players = states.map(s => s.wallet);
  const user1 = states.find(s => s.wallet === players[0]);
  const user2 = states.find(s => s.wallet === players[1]);

  if (typeof user1 === 'undefined' || typeof user2 === 'undefined') {
    throw new Error('Invalid player data');
  }

  return {
    user1: {
      wallet: user1.wallet,
      health: user1.health,
      position: user1.position,
    },
    user2: {
      wallet: user2.wallet,
      health: user2.health,
      position: user2.position,
    },
  };
}

/*
function initialState(lobby: any): PlayerStatePair {
    return {
        user1: {
            wallet: lobby.lobby_creator,
            health: lobby.health,
            position: Math.floor(lobby.grid_size / 2),
        },
        user2: {
            wallet: lobby.player_two as string,
            health: lobby.health,
            position: Math.floor(lobby.grid_size / 2),
        },
    };
}
*/
