import type { Pool } from 'pg';
import {
  getLobbyById,
  getRoundData,
  getCachedMoves,
  getUserStats
} from "@tower-defense/db";
import parse from './parser';
import Prando from 'paima-engine/paima-prando';
import { SCHEDULED_DATA_ADDRESS, SQLUpdate, SubmittedChainData } from 'paima-engine/paima-utils';
import {
  executeZombieRound,
  persistCloseLobby,
  persistLobbyCreation,
  persistLobbyJoin,
  persistMoveSubmission,
  persistNFT,
  persistStatsUpdate,
} from './persist.js';
import { ClosedLobbyInput, ScheduledDataInput, SetNFTInput, SubmittedTurnInput, UserStatsEffect, ZombieRoundEffect } from './types.js';
import { MatchState, Structure, TurnAction } from '@tower-defense/utils';
import { StructuredType } from 'typescript';

export default async function (
  inputData: SubmittedChainData,
  blockHeight: number,
  randomnessGenerator: Prando,
  dbConn: Pool
): Promise<SQLUpdate[]> {
  console.log(inputData, 'parsing input data');
  const user = inputData.userAddress.toLowerCase();
  console.log(`Processing input string: ${inputData.inputData}`);
  const expanded = parse(inputData.inputData);

  console.log(`Input string parsed as: ${expanded.input}`);

  switch (expanded.input) {
    case 'createdLobby':
      return persistLobbyCreation(user, blockHeight, expanded, randomnessGenerator)
    case 'joinedLobby':
      const [lobbyState] = getLobbyById({lobby_id: expanded.lobbyID});
      return persistLobbyJoin(blockHeight, user, expanded, lobbyState);
    case 'closedLobby':
      return processCloseLobby(expanded, user, dbConn);
    case 'submittedTurn':
      return processSubmittedTurn(expanded, user, blockHeight, dbConn, randomnessGenerator)
    case 'setNFT':
      const query = persistNFT(user, blockHeight, expanded as SetNFTInput);
      return [query];
    case 'scheduledData':
      if (user !== SCHEDULED_DATA_ADDRESS) return []
      else processScheduledData(expanded, blockHeight, randomnessGenerator, dbConn)
    case 'invalidString':
      return [];
    default: return []
  }
}

async function processCloseLobby(expanded: ClosedLobbyInput, user: string, dbConn: Pool): Promise<SQLUpdate[]>{
    const [lobbyState] = await getLobbyById.run({ lobby_id: expanded.lobbyID }, dbConn);
    if (!lobbyState) return [];
    const query = persistCloseLobby(user, lobbyState);
    // persisting failed the validation, bail
    if (!query) return [];
    console.log(query, 'closing lobby');
    return [query];
  }
async function processSubmittedTurn(expanded: SubmittedTurnInput, user: string, blockHeight: number, dbConn: Pool, randomnessGenerator: Prando): Promise<SQLUpdate[]>{
    let time = Date.now();
    const [lobby] = await getLobbyById.run({ lobby_id: expanded.lobbyID }, dbConn);
    // if lobby not active or existing, bail
    if (!lobby || lobby.lobby_state !== 'active') return [];
    const users = [lobby.lobby_creator, lobby.player_two];

    // if user does not belong to lobby, bail
    if (!users.includes(user)) return [];

    // if moves sent don't belong to the current round, bail
    if (expanded.roundNumber !== lobby.current_round) return [];

    // If no such round, bail
    const [round] = await getRoundData.run(
      { lobby_id: lobby.lobby_id, round_number: expanded.roundNumber },
      dbConn
    );
    if (!round) return [];

    // <validation
    // TODO we're throwing out all the inputs if a single action is wrong;
    // must discuss this
      if(!validateMoves(expanded.actions, lobby.current_match_state)) return []
    // validation>

    const cachedMoves = await getCachedMoves.run({ lobby_id: expanded.lobbyID }, dbConn);
    return persistMoveSubmission(
      blockHeight,
      user,
      expanded,
      lobby,
      cachedMoves,
      round,
      randomnessGenerator
    );
  
}
function validateMoves(actions: TurnAction[], matchState: MatchState): boolean{
  return actions.reduce((acc, item) => {
    if (item.action === "build") return canBuild(item.x, item.y, item.structure, matchState) ? acc : false
    else return hasStructure(item.id, matchState) ? acc : false
  }, true)

}
// Helper function to see if a structure is being built in an available tile
function canBuild(x: number, y: number, structure: Structure, matchState: MatchState): boolean{
  const faction = structure.includes("rypt") ? "attacker" : "defender";
  const tileIndex = (matchState.width * y) + x;
  const tile = matchState.mapState[tileIndex];
  return tile.type === "open" && tile.faction === faction
}
// Helper function to see if structure ID is on the matchState actor map
function hasStructure(id: number, matchState: MatchState): boolean{
  const hasCrypt = matchState.actors.crypts[id];
  const hasTower = matchState.actors.towers[id];
  return !!hasCrypt || !!hasTower
}

async function processScheduledData(expanded: ScheduledDataInput, blockHeight: number, randomnessGenerator: Prando, dbConn: Pool){
  if (expanded.effect.type === 'zombie') processZombieEffect(expanded, blockHeight,randomnessGenerator,dbConn);
  else if (expanded.effect.type === "stats") processStatsEffect(expanded, dbConn);
}
async function processZombieEffect(expanded: ScheduledDataInput, blockHeight: number, randomnessGenerator: Prando, dbConn: Pool):Promise<SQLUpdate[]>{
      const [lobby] = await getLobbyById.run({ lobby_id: (expanded.effect as ZombieRoundEffect).lobbyID }, dbConn);
      const [round] = await getRoundData.run(
        {lobby_id: lobby.lobby_id, round_number: lobby.current_round},
        dbConn
      )
      const cachedMoves = await getCachedMoves({lobby_id: lobby.lobby_id}, dbConn);
      return executeZombieRound(
        blockHeight,
        lobby,
        round,
        cachedMoves,
        randomnessGenerator
      )
}
async function processStatsEffect(expanded: ScheduledDataInput, dbConn: Pool): Promise<SQLUpdate[]>{
  const effect = expanded.effect as UserStatsEffect;
      const [stats] = await getUserStats.run({ wallet: effect.user }, dbConn);
      console.log(stats, 'stats');
      if (!stats) return [];
      const query = persistStatsUpdate(effect.user, effect.result, stats);
      console.log(query, 'updating stats');
      return [query];
}