import {
  CreatedLobbyInput,
  JoinedLobbyInput,
  WalletAddress,
  SetNFTInput,
  SubmittedTurnInput,
} from './types.js';
import Prando from 'paima-engine/paima-prando';
import { RoundExecutor } from 'paima-engine/paima-executors';
import processTick, { generateRandomMoves, getMap, parseConfig } from '@tower-defense/game-logic';
import { SQLUpdate } from 'paima-engine/paima-utils';
import {
  Faction,
  LobbyStatus,
  MatchConfig,
  MatchState,
  PlayersState,
  PRACTICE_BOT_ADDRESS,
  RawMap,
  Structure,
  Tile,
  TileNumber,
  TurnAction,
} from '@tower-defense/utils';
import {
  createLobby,
  ICreateLobbyParams,
  IGetCachedMovesResult,
  IGetLobbyByIdResult,
  IGetMapLayoutResult,
  IGetRoundDataResult,
  IGetRoundMovesResult,
  IGetUserStatsResult,
  INewMatchMoveParams,
  INewRoundParams,
  INewScheduledDataParams,
  IStartMatchParams,
  ICloseLobbyParams,
  closeLobby,
  move_type,
  newMatchMove,
  newRound,
  newScheduledData,
  startMatch,
  IUpdateCurrentMatchStateParams, 
  executeRound,
  updateCurrentMatchState,
  removeScheduledData,
  IExecuteRoundParams,
  endMatch,
  IUpdateStatsParams,
  updateStats,
  INewNftParams,
  newNft,
  newFinalState
} from '@tower-defense/db';
import parse from './parser.js';

// this file deals with receiving blockchain data input and outputting SQL updates (imported from pgTyped output of our SQL files)
// PGTyped SQL updates are a tuple of the function calling the database and the params sent to it.

// There are generic user inputs: CreateLobby, CloseLobby, JoinLobby, SetNFT. + TD specific ones
// We deal with each on its own `persist` function.
// User Metadata is created first thing inside the persistLobbyCreation and persistLobbyJoin functions.

// Generate blank/empty user stats
function blankStats(wallet: string): SQLUpdate {
  return null as any as SQLUpdate;
}

// Persist creation of a lobby
export function persistLobbyCreation(
  blockHeight: number,
  user: WalletAddress,
  inputData: CreatedLobbyInput,
  randomnessGenerator: Prando
): SQLUpdate[] {
  const lobby_id = randomnessGenerator.nextString(12);
  const params = {
    lobby_id: lobby_id,
    lobby_creator: user,
    creator_faction: inputData.creatorFaction,
    num_of_rounds: inputData.numOfRounds,
    round_length: inputData.roundLength,
    current_round: 0,
    creation_block_height: blockHeight,
    map: inputData.map,
    config_id: inputData.matchConfigID,
    created_at: new Date(),
    hidden: inputData.isHidden,
    practice: inputData.isPractice,
    lobby_state: 'open' as LobbyStatus,
    player_two: null,
    current_match_state: {},
  } satisfies ICreateLobbyParams;
  // create the lobby according to the input data.
  const createLobbyTuple: SQLUpdate = [createLobby, params];
  // create user metadata if non existent
  const blankStatsTuple: SQLUpdate = blankStats(user);
  // In case of a practice lobby join with a predetermined opponent right away and use the same animal as user
  return [createLobbyTuple, blankStatsTuple];
}
export function persistPracticeLobbyCreation(
  blockHeight: number,
  user: WalletAddress,
  inputData: CreatedLobbyInput,
  map: IGetMapLayoutResult,
  randomnessGenerator: Prando,
): SQLUpdate[]{
  const lobby_id = randomnessGenerator.nextString(12);
  const params = {
    lobby_id: lobby_id,
    lobby_creator: user,
    creator_faction: inputData.creatorFaction,
    num_of_rounds: inputData.numOfRounds,
    round_length: inputData.roundLength,
    current_round: 0,
    creation_block_height: blockHeight,
    map: inputData.map,
    config_id: inputData.matchConfigID,
    created_at: new Date(),
    hidden: inputData.isHidden,
    practice: inputData.isPractice,
    lobby_state: 'open' as LobbyStatus,
    player_two: null,
    current_match_state: {},
  } satisfies ICreateLobbyParams;
  // create the lobby according to the input data.
  const createLobbyTuple: SQLUpdate = [createLobby, params];
  // create user metadata if non existent
  const blankStatsTuple: SQLUpdate = blankStats(user);
  // In case of a practice lobby join with a predetermined opponent right away and use the same animal as user
  const practiceLobbyTuples = persistLobbyJoin(
    blockHeight,
    PRACTICE_BOT_ADDRESS,
    params,
    map,
    randomnessGenerator
  );
  return [createLobbyTuple, blankStatsTuple, ...practiceLobbyTuples];
}
// TODO PLAYER TURNS / ROUNDS ???
function generateMatchState(
  lobbyState: IGetLobbyByIdResult,
  playerTwo: WalletAddress,
  mapLayout: string,
  randomnessGenerator: Prando
): MatchState {
  const [attacker, defender] =
    lobbyState.creator_faction === 'attacker'
      ? [lobbyState.lobby_creator, playerTwo]
      : lobbyState.creator_faction === 'defender'
      ? [playerTwo, lobbyState.creator_faction]
      : randomizeRoles(lobbyState.lobby_creator, playerTwo, randomnessGenerator);
  const matchConfig = parseConfig(lobbyState.config_id);
  // TODO are all maps going to be the same width?
  const rawMap = processMapLayout(lobbyState.map, mapLayout);
  const annotatedMap = getMap(rawMap);
  return {
    ...annotatedMap,
    attacker,
    defender,
    attackerGold: matchConfig.baseAttackerGoldRate, // TODO
    defenderGold: matchConfig.baseDefenderGoldRate, // TODO
    attackerBase: { level: 1 },
    defenderBase: { level: 1, health: matchConfig.defenderBaseHealth }, // TODO
    actorCount: 2,
    actors: { crypts: [], towers: [], units: [] },
    currentRound: 1,
    playerTurn: 'defender', // TODO
  };
}
function randomizeRoles(
  creator: WalletAddress,
  joiner: WalletAddress,
  randomnessGenerator: Prando
): [WalletAddress, WalletAddress] {
  const number = randomnessGenerator.next();
  if (number < 0.5) return [creator, joiner];
  else return [joiner, creator];
}
// Layouts as given by catastrophe are a long string, with rows of numbers
// separated by \r\n .
function processMapLayout(mapName: string, mapString: string): RawMap {
  const rows = mapString.split('\r\n');
  return {
    name: mapName,
    width: rows[0].length,
    height: rows.length,
    contents: rows.join('').split('') as unknown as TileNumber[],
  };
}

// Persist joining a lobby
export function persistLobbyJoin(
  blockHeight: number,
  user: WalletAddress,
  lobbyState: IGetLobbyByIdResult,
  map: IGetMapLayoutResult,
  randomnessGenerator: Prando
): SQLUpdate[] {
  if (
    !lobbyState.player_two &&
    lobbyState.lobby_state === 'open' &&
    lobbyState.lobby_creator !== user
  ) {
    // We initialize the match state on lobby joining
    const matchState = generateMatchState(lobbyState, user, map.layout, randomnessGenerator);
    const updateLobbyTuple = activateLobby(user, lobbyState, matchState, blockHeight);
    const blankStatsTuple: SQLUpdate = blankStats(user);
    return [...updateLobbyTuple, blankStatsTuple];
  } else return [];
}

// Convert lobby from `open` to `close`
export function persistCloseLobby(
  user: WalletAddress,
  lobby: IGetLobbyByIdResult
): SQLUpdate | null {
  if (lobby.player_two || lobby.lobby_state !== 'open' || lobby.lobby_creator !== user) return null;
  const params: ICloseLobbyParams = {
    lobby_id: lobby.lobby_id,
  };
  return [closeLobby, params];
}

// Convert lobby from `open` to `active`
function activateLobby(
  user: WalletAddress,
  lobbyState: IGetLobbyByIdResult,
  matchState: MatchState,
  blockHeight: number
): SQLUpdate[] {
  const smParams: IStartMatchParams = {
    lobby_id: lobbyState.lobby_id,
    player_two: user,
    current_match_state: matchState as any, // TODO mmm
  };
  const newMatchTuple: SQLUpdate = [startMatch, smParams];
  const newRoundTuple = incrementRound(
    lobbyState.lobby_id,
    0,
    lobbyState.round_length,
    blockHeight
  );
  // We insert the round and first two empty user states in their tables at this stage, so the round executor has empty states to iterate from.
  return [newMatchTuple];
}

// This function inserts a new empty round in the database.
// We schedule rounds here for future automatic execution as zombie rounds in this function.
function incrementRound(
  lobbyID: string,
  round: number,
  round_length: number,
  blockHeight: number
): SQLUpdate[] {
  const nrParams: INewRoundParams = {
    lobby_id: lobbyID,
    round_within_match: round + 1,
    starting_block_height: blockHeight,
    execution_block_height: null,
  };
  const newRoundTuple: SQLUpdate = [newRound, nrParams];
  // Scheduling of the zombie round execution in the future
  const nsdParams: INewScheduledDataParams = {
    block_height: blockHeight + round_length,
    input_data: `z|*${lobbyID}`,
  };
  const newScheduledDataTuple: SQLUpdate = [newScheduledData, nsdParams];
  return [newRoundTuple, newScheduledDataTuple];
}

export function persistMoveSubmission(
  blockHeight: number,
  user: WalletAddress,
  inputData: SubmittedTurnInput,
  lobbyState: IGetLobbyByIdResult,
  matchConfig: MatchConfig,
  cachedMoves: IGetCachedMovesResult[],
  roundData: IGetRoundDataResult,
  randomnessGenerator: Prando
): SQLUpdate[] {
  let movesToCache: SQLUpdate[] = [];
  const users = new Set(cachedMoves.map(m => m.wallet));
  if (!users.has(user)) {
    movesToCache = inputData.actions.map(m => {
      return persistMove(inputData.lobbyID, lobbyState.current_round, user, m);
    });
  }
  // practice lobbies...
  if (lobbyState.practice) {
    const bot = lobbyState.player_two || PRACTICE_BOT_ADDRESS;
    users.add(bot);
    const practiceOpponentMoves = generateRandomMoves(randomnessGenerator).map(m =>
      persistMove(inputData.lobbyID, lobbyState.current_round, user, m)
    );
    movesToCache = [...movesToCache, ...practiceOpponentMoves];
  }
  // Now we check if both users have sent their moves, if so, we execute the round.
  // We'll assume the moves are valid at this stage, invalid moves shouldn't have got this far.
  if (users.add(user).size === 2) {
    const newMoves: IGetRoundMovesResult[] = movesToCache.map(m => m[1].new_move);
    // We combine the presently sent user moves with the previously cached moves we retrieved from the database and pass them all to the round executor
    const moves = [...cachedMoves, ...newMoves];
    // Collect full SQL updates from round executor
    const roundExecutionTuples = execute(
      blockHeight,
      lobbyState,
      matchConfig,
      moves,
      roundData,
      randomnessGenerator
    );
    return [...movesToCache, ...roundExecutionTuples];
  }
  // If moves by both users haven't been sent yet, we just cache the moves sent and wait for further submitted moves later
  else {
    return movesToCache;
  }
}

// Persist submitted move to database
function persistMove(
  matchId: string,
  round: number,
  user: WalletAddress,
  a: TurnAction
): SQLUpdate {
  const move_target = a.action === 'build' ? conciseBuild(a.structure, a.x, a.y) : `${a.id}`;
  const mmParams: INewMatchMoveParams = {
    new_move: {
      lobby_id: matchId,
      wallet: user,
      round: round,
      move_type: a.action as move_type,
      move_target,
    },
  };
  return [newMatchMove, mmParams];
}
// Calls the 'round executor' and produces the necessary SQL updates which result
function execute(
  blockHeight: number,
  lobbyState: IGetLobbyByIdResult,
  matchConfig: MatchConfig,
  cachedMoves: IGetRoundMovesResult[],
  roundData: IGetRoundDataResult,
  randomnessGenerator: Prando
): SQLUpdate[] {
  const matchState = lobbyState.current_match_state as unknown as MatchState;
  const moves = cachedMoves.map(m => expandMove(m));
  const executor = RoundExecutor.initialize(
    matchConfig,
    matchState,
    moves,
    randomnessGenerator,
    processTick
  );
  // We get the new matchState from the round executor
  const newState = executor.endState(); 
  // We close the round by updating it with the execution blockHeight
  const exParams: IExecuteRoundParams = {
    lobby_id: lobbyState.lobby_id,
    round: lobbyState.current_round,
    execution_block_height: blockHeight,
  };
  const executeRoundTuple: SQLUpdate = [executeRound, exParams];
  // We also remove it from scheduled_data as it's not a zombie anymore
  const removeScheduledDataTuple: SQLUpdate = [
    removeScheduledData,
    {
      block_height: roundData.starting_block_height + lobbyState.round_length,
      input_data: `z|*${lobbyState.lobby_id}`,
    },
  ];
  // We update the lobby row with the new json state
  const stateParams: IUpdateCurrentMatchStateParams = {
    current_match_state: newState as any,
    lobby_id: lobbyState.lobby_id
  }
  const updateStateTuple: SQLUpdate = [updateCurrentMatchState, stateParams];
  // Finalize match if defender dies or we've reached the final round
  if (newState.defenderBase.health <= 0 || lobbyState.current_round === lobbyState.num_of_rounds) {
    console.log('match ended by player victory, finalizing');
    const finalizeMatchTuples: SQLUpdate[] = finalizeMatch(
      blockHeight,
      lobbyState,
      newState
    );
    return [executeRoundTuple, removeScheduledDataTuple, updateStateTuple, ...finalizeMatchTuples];
  }
  // Increment round and update match state if not at final round
  else{
    const incrementRoundTuple = incrementRound(
      lobbyState.lobby_id,
      lobbyState.current_round,
      lobbyState.round_length,
      blockHeight
    );
    return [executeRoundTuple, removeScheduledDataTuple, ...incrementRoundTuple, updateStateTuple]
  }
}
// Database stores a "move_target", which is the structure ID as a string
// unless it's a "build" action, in which we encode is as `${structureType}--${x coordinate}-${y cordinate}`
// TODO Typing is weird here so might need to revisit
function conciseBuild(structure: Structure, x: number, y: number): string {
  return `${structure}--${x}-${y}`;
}
function expandMove(databaseMove: IGetRoundMovesResult): TurnAction {
  if (databaseMove.move_type === 'build') {
    const [structure, coords] = databaseMove.move_target.split('--');
    const [x, y] = coords.split('-');
    return {
      round: databaseMove.round,
      action: databaseMove.move_type,
      structure: structure as Structure,
      x: parseInt(x),
      y: parseInt(y),
    };
  } else
    return {
      round: databaseMove.round,
      action: databaseMove.move_type,
      id: parseInt(databaseMove.move_target),
    };
}
// Finalizes the match and updates user statistics according to final score of the match
function finalizeMatch(
  blockHeight: number,
  lobbyState: IGetLobbyByIdResult,
  matchState: MatchState
): SQLUpdate[] {
  const endMatchTuple: SQLUpdate = [endMatch, { lobby_id: lobbyState.lobby_id, current_match_state: matchState }];
  if (lobbyState.practice) {
    console.log(`Practice match ended, ignoring results`);
    return [endMatchTuple];
  }
  // Save the final user states in the final state table
  const [p1Gold, p2Gold] = matchState.attacker === lobbyState.creator_faction
  ? [matchState.attackerGold, matchState.defenderGold] : [matchState.defenderGold, matchState.attackerGold];
  const [p1Result, p2Result] = matchState.defenderBase.health > 0 ? ["loss", "win"] : ["win",  "loss"]
  const finalMatchTuple: SQLUpdate = [
    newFinalState,
    {
      final_state: {
        lobby_id: lobbyState.lobby_id,
        player_one_wallet: lobbyState.lobby_creator,
        player_one_result: p1Result,
        player_one_gold: p1Gold,
        player_two_wallet: lobbyState.player_two,
        player_two_result: p2Result,
        player_two_gold: p2Gold,
        final_health: matchState.defenderBase.health
      },
    },
  ];
  // Create the new scheduled data for updating user stats
  const user1params: INewScheduledDataParams = {
    block_height: blockHeight + 1,
    input_data: `u|*${lobbyState.lobby_creator}|${p1Result[0]}`,
  };
  const user2params: INewScheduledDataParams = {
    block_height: blockHeight + 1,
    input_data: `u|*${lobbyState.player_two}|${p2Result[0]}`,
  };
  const scheduledData1: SQLUpdate = [newScheduledData, user1params];
  const scheduledData2: SQLUpdate = [newScheduledData, user2params];
  console.log('persisting match finalizing');
  return [endMatchTuple, finalMatchTuple, scheduledData1, scheduledData2];
}

// Scheduled Data
export function persistStatsUpdate(
  user: WalletAddress,
  result: ConciseResult,
  stats: IGetUserStatsResult
): SQLUpdate {
  const userParams: IUpdateStatsParams = {
    stats: {
      wallet: user,
      wins: result === 'w' ? stats.wins + 1 : stats.wins,
      losses: result === 'l' ? stats.losses + 1 : stats.losses,
    },
  };
  return [updateStats, userParams];
}

type ConciseResult = 'w' | 't' | 'l';

// This function executes 'zombie rounds', rounds where both users haven't submitted input, but which have reached the specified timeout time per round.
// We just call the 'execute' function passing the unexecuted moves from the database, if any.
export function executeZombieRound(
  blockHeight: number,
  lobbyState: IGetLobbyByIdResult,
  matchConfig: MatchConfig,
  moves: IGetRoundMovesResult[],
  roundData: IGetRoundDataResult,
  randomnessGenerator: Prando
) {
  console.log(
    `Executing zombie round (#${lobbyState.current_round}) for lobby ${lobbyState.lobby_id}`
  );
  return execute(blockHeight, lobbyState, matchConfig, moves, roundData, randomnessGenerator);
}

// Persists the submitted data from a `Set NFT` game input
export function persistNFT(
  user: WalletAddress,
  blockHeight: number,
  inputData: SetNFTInput
): SQLUpdate {
  const params: INewNftParams = {
    wallet: user,
    block_height: blockHeight,
    address: inputData.address,
    token_id: inputData.tokenID,
    timestamp: new Date(),
  };
  return [newNft, params];
}
