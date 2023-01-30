import { CreatedLobbyInput, JoinedLobbyInput, WalletAddress, SetNFTInput } from './types.js';
import Prando from 'paima-engine/paima-prando';
import { RoundExecutor } from 'paima-engine/paima-executors';
import processTick, { getMap, parseConfig } from '@tower-defense/game-logic';
import { SQLUpdate } from 'paima-engine/paima-utils';
import {
  Faction,
  LobbyStatus,
  MatchState,
  PlayersState,
  PRACTICE_BOT_ADDRESS,
  RawMap,
  Tile,
  TileNumber,
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
  INewRoundParams,
  INewScheduledDataParams,
  IStartMatchParams, 
  newRound, 
  newScheduledData, 
  startMatch
} from '@tower-defense/db';

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
  user: WalletAddress,
  blockHeight: number,
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
  if (inputData.isPractice){
    const practiceLobbyTuples = persistLobbyJoin(
        blockHeight,
        PRACTICE_BOT_ADDRESS,
        params,
        "", // TODO
        randomnessGenerator
    )
    return [createLobbyTuple, blankStatsTuple, ...practiceLobbyTuples]
  } else return [createLobbyTuple, blankStatsTuple]
}
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
function randomizeRoles(creator: WalletAddress, joiner: WalletAddress, randomnessGenerator: Prando): [WalletAddress, WalletAddress] {
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
  return null;
}

// Convert lobby from `open` to `active`
function activateLobby(
  user: WalletAddress,
  lobbyState: IGetLobbyByIdResult,
  matchState: MatchState,
  blockHeight: number,
): SQLUpdate[] {
  const smParams: IStartMatchParams = {
    lobby_id: lobbyState.lobby_id,
    player_two: user,
    current_match_state: matchState as any // TODO mmm
  };
  const newMatchTuple: SQLUpdate = [startMatch, smParams];
  const newRoundTuple = incrementRound(lobbyState.lobby_id, 0, lobbyState.round_length, blockHeight)
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
  inputData: any,
  lobbyState: IGetLobbyByIdResult,
  cachedMoves: IGetCachedMovesResult[],
  roundData: IGetRoundDataResult,
  randomnessGenerator: Prando
): SQLUpdate[] {
  return [];
}

// Calls the 'round executor' and produces the necessary SQL updates which result
function execute(
  blockHeight: number,
  lobbyState: IGetLobbyByIdResult,
  moves: IGetRoundMovesResult[],
  roundData: IGetRoundDataResult,
  randomnessGenerator: Prando
): SQLUpdate[] {
  return [];
}

export function persistStatsUpdate(
  user: WalletAddress,
  result: ConciseResult,
  stats: IGetUserStatsResult
): SQLUpdate {
  return null as any as SQLUpdate;
}

type ConciseResult = 'w' | 't' | 'l';
type ExpandedResult = 'win' | 'tie' | 'loss';
function expandResult(c: ConciseResult): ExpandedResult {
  if (c === 'w') return 'win';
  else if (c === 't') return 'tie';
  else return 'loss';
}

// Finalizes the match and updates user statistics according to final score of the match
function finalizeMatch(
  blockHeight: number,
  lobbyID: string,
  isPractice: boolean,
  states: PlayersState
): SQLUpdate[] {
  return [];
}

// Compute which of the two players is the winner (or if it's a tie, null)
function computeWinner(states: PlayersState): string | null {
  if (states.user1.health > states.user2.health) return states.user1.wallet;
  else if (states.user1.health < states.user2.health) return states.user2.wallet;
  else return null;
}

// Persist submitted move to database
function persistMove(matchId: string, round: number, user: WalletAddress, move: any): SQLUpdate {
  return null as any as SQLUpdate;
}

// This function executes 'zombie rounds', rounds where both users haven't submitted input, but which have reached the specified timeout time per round.
// We just call the 'execute' function passing the unexecuted moves from the database, if any.
export function executeZombieRound(
  blockHeight: number,
  lobbyState: IGetLobbyByIdResult,
  moves: IGetRoundMovesResult[],
  roundData: IGetRoundDataResult,
  randomnessGenerator: Prando
) {
  console.log(
    `Executing zombie round (#${lobbyState.current_round}) for lobby ${lobbyState.lobby_id}`
  );
  return execute(blockHeight, lobbyState, moves, roundData, randomnessGenerator);
}

// Persists the submitted data from a `Set NFT` game input
export function persistNFT(
  user: WalletAddress,
  blockHeight: number,
  inputData: SetNFTInput
): SQLUpdate {
  return null as any as SQLUpdate;
}
