import type { Pool } from 'pg';
import type Prando from 'paima-engine/paima-prando';
import type { SQLUpdate } from 'paima-engine/paima-db';
import type { WalletAddress } from 'paima-engine/paima-utils';

import type { IGetLobbyByIdResult, IGetRoundDataResult } from '@tower-defense/db';
import {
  getLobbyById,
  getRoundData,
  getUserStats,
  getMapLayout,
  getMatchConfig,
} from '@tower-defense/db';
import { executeZombieRound, persistMoveSubmission, persistNFT, finalizeMatch } from './persist.js';
import type {
  ClosedLobbyInput,
  CreatedLobbyInput,
  JoinedLobbyInput,
  ScheduledDataInput,
  SetNFTInput,
  SubmittedTurnInput,
  UserStats,
  ZombieRound,
} from './types.js';
import { isUserStats, isZombieRound } from './types.js';
import type { MatchConfig, MatchState, TurnAction } from '@tower-defense/utils';
import processTick, { parseConfig, validateMoves } from '@tower-defense/game-logic';
import { roundExecutor } from 'paima-engine/paima-executors';
import { persistExecutedRound, persistNewRound, persistUpdateMatchState } from './persist/match.js';
import {
  persistCloseLobby,
  persistLobbyCreation,
  persistLobbyJoin,
  persistPracticeLobbyCreation,
} from './persist/lobby.js';
import { persistStatsUpdate } from './persist/stats.js';

export const processCreateLobby = async (
  user: WalletAddress,
  blockHeight: number,
  input: CreatedLobbyInput,
  randomnessGenerator: Prando,
  dbConn: Pool
): Promise<SQLUpdate[]> => {
  if (input.isPractice) {
    const [map] = await getMapLayout.run({ name: input.map }, dbConn);
    const [configContent] = await getMatchConfig.run({ id: input.matchConfigID }, dbConn);
    return persistPracticeLobbyCreation(
      blockHeight,
      user,
      input,
      map,
      configContent.content,
      randomnessGenerator
    );
  }
  return persistLobbyCreation(blockHeight, user, input, randomnessGenerator);
};

export const processJoinLobby = async (
  user: WalletAddress,
  blockHeight: number,
  input: JoinedLobbyInput,
  randomnessGenerator: Prando,
  dbConn: Pool
): Promise<SQLUpdate[]> => {
  const [lobbyState] = await getLobbyById.run({ lobby_id: input.lobbyID }, dbConn);
  // if Lobby doesn't exist, bail
  if (!lobbyState) return [];
  const [map] = await getMapLayout.run({ name: lobbyState.map }, dbConn);
  // if match config is not in the database, bail
  const [configString] = await getMatchConfig.run({ id: lobbyState.config_id }, dbConn);
  if (!configString) return [];
  return persistLobbyJoin(
    blockHeight,
    user,
    lobbyState,
    map,
    configString.content,
    randomnessGenerator
  );
};

export async function processCloseLobby(
  user: WalletAddress,
  input: ClosedLobbyInput,
  dbConn: Pool
): Promise<SQLUpdate[]> {
  const [lobbyState] = await getLobbyById.run({ lobby_id: input.lobbyID }, dbConn);
  if (!lobbyState) return [];
  const query = persistCloseLobby(user, lobbyState);
  // persisting failed the validation, bail
  if (!query) return [];
  return [query];
}

export function processSetNFT(user: WalletAddress, blockHeight: number, expanded: SetNFTInput) {
  const query = persistNFT(user, blockHeight, expanded);
  return [query];
}

export async function processSubmittedTurn(
  blockHeight: number,
  user: string,
  input: SubmittedTurnInput,
  randomnessGenerator: Prando,
  dbConn: Pool
): Promise<SQLUpdate[]> {
  const [lobby] = await getLobbyById.run({ lobby_id: input.lobbyID }, dbConn);
  // if lobby not active or existing, bail
  if (!lobby || lobby.lobby_state !== 'active') return [];
  const users = [lobby.lobby_creator, lobby.player_two];
  // if user does not belong to lobby, bail
  if (!users.includes(user)) return [];
  // if match config is not in the database, bail
  const [configString] = await getMatchConfig.run({ id: lobby.config_id }, dbConn);
  if (!configString) return [];
  // if moves sent don't belong to the current round, bail
  if (input.roundNumber !== lobby.current_round) return [];
  // <validation
  // role is valid
  // NOTE: defenders are odd turns, attackers are even turns
  const role =
    user === (lobby.current_match_state as unknown as MatchState).attacker
      ? 'attacker'
      : 'defender';
  // add the faction to the actions in the input
  input.actions = input.actions.map(action => ({
    ...action,
    faction: role,
    round: input.roundNumber,
  }));
  if (role === 'attacker' && lobby.current_round % 2 !== 0) return [];
  if (role === 'defender' && lobby.current_round % 2 !== 1) return [];
  // moves are valid
  if (!validateMoves(input.actions, role, lobby.current_match_state as unknown as MatchState)) {
    console.log('invalid moves');
    return [];
  }
  // validation>

  // If no such round, bail
  const [round] = await getRoundData.run(
    { lobby_id: lobby.lobby_id, round_number: input.roundNumber },
    dbConn
  );
  if (!round) return [];

  const matchConfig = parseConfig(configString.content);
  return persistMoveSubmission(
    blockHeight,
    user,
    input,
    lobby,
    matchConfig,
    round,
    randomnessGenerator
  );
}

export async function processScheduledData(
  input: ScheduledDataInput,
  blockHeight: number,
  randomnessGenerator: Prando,
  dbConn: Pool
): Promise<SQLUpdate[]> {
  if (isZombieRound(input)) {
    return processZombieEffect(input, blockHeight, randomnessGenerator, dbConn);
  }
  if (isUserStats(input)) {
    return processStatsEffect(input, dbConn);
  }
  return [];
}

export async function processZombieEffect(
  input: ZombieRound,
  blockHeight: number,
  randomnessGenerator: Prando,
  dbConn: Pool
): Promise<SQLUpdate[]> {
  const [lobby] = await getLobbyById.run({ lobby_id: input.lobbyID }, dbConn);
  const [round] = await getRoundData.run(
    { lobby_id: lobby.lobby_id, round_number: lobby.current_round },
    dbConn
  );
  const [configString] = await getMatchConfig.run({ id: lobby.config_id }, dbConn);
  if (!configString) return [];
  const matchConfig = parseConfig(configString.content);
  return executeZombieRound(blockHeight, lobby, matchConfig, [], round, randomnessGenerator);
}

export async function processStatsEffect(input: UserStats, dbConn: Pool): Promise<SQLUpdate[]> {
  const [stats] = await getUserStats.run({ wallet: input.user }, dbConn);
  if (!stats) return [];
  const query = persistStatsUpdate(input.user, input.result, stats);
  return [query];
}

// Runs the 'round executor' and produces the necessary SQL updates as a result
export function executeRound(
  blockHeight: number,
  lobby: IGetLobbyByIdResult,
  matchConfig: MatchConfig,
  moves: TurnAction[],
  roundData: IGetRoundDataResult,
  randomnessGenerator: Prando
): SQLUpdate[] {
  const matchState = roundData.match_state as unknown as MatchState;
  const executor = roundExecutor.initialize(
    matchConfig,
    matchState,
    moves,
    randomnessGenerator,
    processTick
  );
  console.log('calling round executor from backend');
  // We get the new matchState from the round executor
  const newState = executor.endState();

  // We generate updates to the lobby to apply the new match state
  const lobbyUpdate = persistUpdateMatchState(lobby.lobby_id, newState);

  // We generate updates for the executed round
  const executedRoundUpdate = persistExecutedRound(roundData, lobby, blockHeight);

  // Finalize match if defender dies or we've reached the final round
  if (newState.defenderBase.health <= 0 || lobby.current_round === lobby.num_of_rounds) {
    console.log(newState.defenderBase.health, 'match ended, finalizing');
    const finalizeMatchTuples: SQLUpdate[] = finalizeMatch(blockHeight, lobby, newState);
    return [lobbyUpdate, ...executedRoundUpdate, ...finalizeMatchTuples];
  }
  // Create a new round and update match state if not at final round
  else {
    const newRoundTuples = persistNewRound(
      lobby.lobby_id,
      lobby.current_round,
      lobby.round_length,
      matchState,
      blockHeight
    );
    return [lobbyUpdate, ...executedRoundUpdate, ...newRoundTuples];
  }
}
