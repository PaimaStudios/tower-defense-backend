import type { Pool } from 'pg';
import {
  getLobbyById,
  getRoundData,
  getCachedMoves,
  getUserStats,
  getMapLayout,
  getMatchConfig,
} from '@tower-defense/db';
import parse from './parser';
import Prando from 'paima-engine/paima-prando';
import { SCHEDULED_DATA_ADDRESS, SQLUpdate, SubmittedChainData } from 'paima-engine/paima-utils';
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
import { Faction, MatchState, parseInput, Structure, TurnAction } from '@tower-defense/utils';
import { parseConfig } from '@tower-defense/game-logic';

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
        return persistPracticeLobbyCreation(blockHeight, user, expanded, map, randomnessGenerator);
      } else return persistLobbyCreation(blockHeight, user, expanded, randomnessGenerator);
    case 'joinedLobby':
      const [lobbyState] = await getLobbyById.run({ lobby_id: expanded.lobbyID }, dbConn);
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
      else processScheduledData(expanded, blockHeight, randomnessGenerator, dbConn);
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
  console.log(query, 'closing lobby');
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
  console.log(lobby.current_round, 'current round');
  console.log(expanded.roundNumber, 'round sent');
  if (expanded.roundNumber !== lobby.current_round) return [];
  // <validation
  // role is valid
  // NOTE: defenders are odd turns, attackers are even turns
  const role =
    user === (lobby.current_match_state as unknown as MatchState).attacker
      ? 'attacker'
      : 'defender';
  console.log(role, 'role');
  // add the faction to the actions in the input
  expanded.actions = expanded.actions.map(a => {
    return {...a, faction: role}
  })
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
function validateMoves(actions: TurnAction[], faction: Faction, matchState: MatchState): boolean {
  const res = actions.reduce((acc, item) => {
    if (item.action === 'build')
      return canBuild(faction, item.coordinates, item.structure, matchState) ? acc : false;
    else return hasStructure(faction, item.id, matchState) ? acc : false;
  }, true);
  return res;
}
// Helper function to see if a structure is being built in an available tile
function canBuild(
  faction: Faction,
  coords: number,
  structure: Structure,
  matchState: MatchState
): boolean {
  const structureFaction = structure.includes('rypt') ? 'attacker' : 'defender';
  const tile = matchState.mapState[coords];
  return tile.type === 'open' && tile.faction === faction && faction === structureFaction;
}
// Helper function to see if structure ID is on the matchState actor map
function hasStructure(faction: Faction, id: number, matchState: MatchState): boolean {
  if (faction === 'attacker') return !!matchState.actors.crypts[id];
  else return !!matchState.actors.towers[id];
}

async function processScheduledData(
  expanded: ScheduledDataInput,
  blockHeight: number,
  randomnessGenerator: Prando,
  dbConn: Pool
) {
  if (expanded.effect.type === 'zombie')
    processZombieEffect(expanded, blockHeight, randomnessGenerator, dbConn);
  else if (expanded.effect.type === 'stats') processStatsEffect(expanded, dbConn);
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
  const cachedMoves = await getCachedMoves.run({ lobby_id: lobby.lobby_id }, dbConn);
  return executeZombieRound(
    blockHeight,
    lobby,
    matchConfig,
    cachedMoves,
    round,
    randomnessGenerator
  );
}
async function processStatsEffect(
  expanded: ScheduledDataInput,
  dbConn: Pool
): Promise<SQLUpdate[]> {
  const effect = expanded.effect as UserStatsEffect;
  const [stats] = await getUserStats.run({ wallet: effect.user }, dbConn);
  console.log(stats, 'stats');
  if (!stats) return [];
  const query = persistStatsUpdate(effect.user, effect.result, stats);
  console.log(query, 'updating stats');
  return [query];
}
