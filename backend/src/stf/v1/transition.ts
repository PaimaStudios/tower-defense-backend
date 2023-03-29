import type { Pool } from 'pg';
import {
  getLobbyById,
  getRoundData,
  getUserStats,
  getMapLayout,
  getMatchConfig,
} from '@tower-defense/db';
import Prando from 'paima-engine/paima-prando';
import { SCHEDULED_DATA_ADDRESS, SubmittedChainData } from 'paima-engine/paima-utils';
import {
  executeZombieRound,
  persistCloseLobby,
  persistLobbyCreation,
  persistPracticeLobbyCreation,
  persistLobbyJoin,
  persistMoveSubmission,
  persistNFT,
  persistStatsUpdate,
} from './persist.js';
import {
  ClosedLobbyInput,
  ScheduledDataInput,
  SetNFTInput,
  SubmittedTurnInput,
  UserStatsEffect,
  ZombieRoundEffect,
} from './types.js';
import { MatchState, parseInput } from '@tower-defense/utils';
import { parseConfig } from '@tower-defense/game-logic';
import { validateMoves } from '@tower-defense/game-logic';
import { SQLUpdate } from 'paima-engine/paima-db';

export default async function (
  inputData: SubmittedChainData,
  blockHeight: number,
  randomnessGenerator: Prando,
  dbConn: Pool
): Promise<SQLUpdate[]> {
  console.log(inputData, 'parsing input data');
  const user = inputData.userAddress.toLowerCase();
  console.log(`Processing input string: ${inputData.inputData}`);
  const expanded = parseInput(inputData.inputData);
  console.log(`Input string parsed as: ${expanded.input}`);
  switch (expanded.input) {
    case 'createdLobby':
      if (expanded.isPractice) {
        const [map] = await getMapLayout.run({ name: expanded.map }, dbConn);
        const [configContent] = await getMatchConfig.run({ id: expanded.matchConfigID }, dbConn);
        return persistPracticeLobbyCreation(
          blockHeight,
          user,
          expanded,
          map,
          configContent.content,
          randomnessGenerator
        );
      } else return persistLobbyCreation(blockHeight, user, expanded, randomnessGenerator);
    case 'joinedLobby':
      const [lobbyState] = await getLobbyById.run({ lobby_id: expanded.lobbyID }, dbConn);
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
    case 'closedLobby':
      return processCloseLobby(user, expanded, dbConn);
    case 'submittedTurn':
      return processSubmittedTurn(blockHeight, user, expanded, randomnessGenerator, dbConn);
    case 'setNFT':
      const query = persistNFT(user, blockHeight, expanded as SetNFTInput);
      return [query];
    case 'scheduledData':
      if (user !== SCHEDULED_DATA_ADDRESS) return [];
      else return processScheduledData(expanded, blockHeight, randomnessGenerator, dbConn);
    case 'invalidString':
      return [];
    default:
      return [];
  }
}

async function processCloseLobby(
  user: string,
  expanded: ClosedLobbyInput,
  dbConn: Pool
): Promise<SQLUpdate[]> {
  const [lobbyState] = await getLobbyById.run({ lobby_id: expanded.lobbyID }, dbConn);
  if (!lobbyState) return [];
  const query = persistCloseLobby(user, lobbyState);
  // persisting failed the validation, bail
  if (!query) return [];
  return [query];
}
async function processSubmittedTurn(
  blockHeight: number,
  user: string,
  expanded: SubmittedTurnInput,
  randomnessGenerator: Prando,
  dbConn: Pool
): Promise<SQLUpdate[]> {
  const [lobby] = await getLobbyById.run({ lobby_id: expanded.lobbyID }, dbConn);
  // if lobby not active or existing, bail
  if (!lobby || lobby.lobby_state !== 'active') return [];
  const users = [lobby.lobby_creator, lobby.player_two];
  // if user does not belong to lobby, bail
  if (!users.includes(user)) return [];
  // if match config is not in the database, bail
  const [configString] = await getMatchConfig.run({ id: lobby.config_id }, dbConn);
  if (!configString) return [];
  // if moves sent don't belong to the current round, bail
  if (expanded.roundNumber !== lobby.current_round) return [];
  // <validation
  // role is valid
  // NOTE: defenders are odd turns, attackers are even turns
  const role =
    user === (lobby.current_match_state as unknown as MatchState).attacker
      ? 'attacker'
      : 'defender';
  // add the faction to the actions in the input
  expanded.actions = expanded.actions.map(a => {
    return { ...a, faction: role, round: expanded.roundNumber };
  });
  if (role === 'attacker' && lobby.current_round % 2 !== 0) return [];
  if (role === 'defender' && lobby.current_round % 2 !== 1) return [];
  // moves are valid
  if (!validateMoves(expanded.actions, role, lobby.current_match_state as unknown as MatchState)) {
    console.log('invalid moves');
    return [];
  }
  // validation>

  // If no such round, bail
  const [round] = await getRoundData.run(
    { lobby_id: lobby.lobby_id, round_number: expanded.roundNumber },
    dbConn
  );
  if (!round) return [];

  const matchConfig = parseConfig(configString.content);
  return persistMoveSubmission(
    blockHeight,
    user,
    expanded,
    lobby,
    matchConfig,
    round,
    randomnessGenerator
  );
}

async function processScheduledData(
  expanded: ScheduledDataInput,
  blockHeight: number,
  randomnessGenerator: Prando,
  dbConn: Pool
): Promise<SQLUpdate[]> {
  if (expanded.effect.type === 'zombie')
    return processZombieEffect(expanded, blockHeight, randomnessGenerator, dbConn);
  else if (expanded.effect.type === 'stats') return processStatsEffect(expanded, dbConn);
  else return [];
}
async function processZombieEffect(
  expanded: ScheduledDataInput,
  blockHeight: number,
  randomnessGenerator: Prando,
  dbConn: Pool
): Promise<SQLUpdate[]> {
  const [lobby] = await getLobbyById.run(
    { lobby_id: (expanded.effect as ZombieRoundEffect).lobbyID },
    dbConn
  );
  const [round] = await getRoundData.run(
    { lobby_id: lobby.lobby_id, round_number: lobby.current_round },
    dbConn
  );
  const [configString] = await getMatchConfig.run({ id: lobby.config_id }, dbConn);
  if (!configString) return [];
  const matchConfig = parseConfig(configString.content);
  return executeZombieRound(blockHeight, lobby, matchConfig, [], round, randomnessGenerator);
}
async function processStatsEffect(
  expanded: ScheduledDataInput,
  dbConn: Pool
): Promise<SQLUpdate[]> {
  const effect = expanded.effect as UserStatsEffect;
  const [stats] = await getUserStats.run({ wallet: effect.user }, dbConn);
  if (!stats) return [];
  const query = persistStatsUpdate(effect.user, effect.result, stats);
  return [query];
}
