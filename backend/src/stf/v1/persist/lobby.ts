import type Prando from 'paima-engine/paima-prando';
import type { WalletAddress } from 'paima-engine/paima-utils';
import type { CreatedLobbyInput } from '../types';
import type { SQLUpdate } from 'paima-engine/paima-db';
import type {
  ICloseLobbyParams,
  ICreateLobbyParams,
  IGetLobbyByIdResult,
  IGetMapLayoutResult,
  IGetRoundDataResult,
  IStartMatchParams,
} from '@tower-defense/db';
import { closeLobby, startMatch } from '@tower-defense/db';
import { createLobby } from '@tower-defense/db';
import type { MatchState, RawMap, RoleSetting, TileNumber } from '@tower-defense/utils';
import { PRACTICE_BOT_ADDRESS } from '@tower-defense/utils';
import { getMap, parseConfig } from '@tower-defense/game-logic';
import { blankStats } from './stats';
import { practiceRound } from '../transition';
import { persistNewRound } from './match';

// TODO PLAYER TURNS / ROUNDS ???
function generateMatchState(
  lobbyState: IGetLobbyByIdResult,
  playerTwo: WalletAddress,
  mapLayout: string,
  configString: string,
  randomnessGenerator: Prando
): MatchState {
  const [attacker, defender] =
    lobbyState.creator_faction === 'attacker'
      ? [lobbyState.lobby_creator, playerTwo]
      : lobbyState.creator_faction === 'defender'
      ? [playerTwo, lobbyState.lobby_creator]
      : randomizeRoles(lobbyState.lobby_creator, playerTwo, randomnessGenerator);
  const matchConfig = parseConfig(configString);
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
    actors: { crypts: {}, towers: {}, units: {} },
    currentRound: 1,
    finishedSpawning: [],
    roundEnded: false,
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
  const rows = mapString.split('\\r\\n');
  return {
    name: mapName,
    width: rows[0].length,
    height: rows.length,
    contents: rows
      .reverse()
      .join('')
      .split('')
      .map(s => parseInt(s) as TileNumber),
  };
}

// Persist creation of a lobby
export function persistLobbyCreation(
  blockHeight: number,
  user: WalletAddress,
  inputData: CreatedLobbyInput,
  randomnessGenerator: Prando
): SQLUpdate[] {
  const lobby_id = randomnessGenerator.nextString(12);
  const params: ICreateLobbyParams = {
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
    lobby_state: 'open',
    player_two: null,
    current_match_state: {},
  };
  // create the lobby according to the input data.
  const createLobbyTuple: SQLUpdate = [createLobby, params];
  // create user metadata if non existent
  const blankStatsTuple: SQLUpdate = blankStats(user);
  return [createLobbyTuple, blankStatsTuple];
}
export function persistPracticeLobbyCreation(
  blockHeight: number,
  user: WalletAddress,
  inputData: CreatedLobbyInput,
  map: IGetMapLayoutResult,
  configContent: string,
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
    lobby_state: 'open',
    player_two: null,
    current_match_state: {},
  } satisfies ICreateLobbyParams;
  // create the lobby according to the input data.
  const createLobbyTuple: SQLUpdate = [createLobby, params];
  // create user metadata if non existent
  const blankStatsTuple: SQLUpdate = blankStats(user);
  const practiceLobbyTuples = persistLobbyJoin(
    blockHeight,
    PRACTICE_BOT_ADDRESS,
    params,
    map,
    configContent,
    randomnessGenerator
  );
  return [createLobbyTuple, blankStatsTuple, ...practiceLobbyTuples];
}

// Persist joining a lobby
export function persistLobbyJoin(
  blockHeight: number,
  user: WalletAddress,
  lobby: IGetLobbyByIdResult,
  map: IGetMapLayoutResult,
  configString: string,
  randomnessGenerator: Prando
): SQLUpdate[] {
  if (lobby.player_two || lobby.lobby_state !== 'open' || lobby.lobby_creator === user) {
    return [];
  }
  // We initialize the match state on lobby joining
  const matchState = generateMatchState(lobby, user, map.layout, configString, randomnessGenerator);
  // We update the Lobby table with the new state, and determine the creator role if it was random
  const creator_role =
    lobby.creator_faction === 'random'
      ? matchState.attacker === lobby.lobby_creator
        ? 'attacker'
        : 'defender'
      : lobby.creator_faction;
  // If it's a practice lobby and it's the bot's turn first we run that turn too.
  const firstRound =
    lobby.practice && creator_role === 'attacker'
      ? practiceRound(
          blockHeight,
          { ...lobby, current_round: 1 },
          parseConfig(configString),
          // We have to pass it fake round data as the round hasn't been persisted yet.
          constructRoundData(lobby.lobby_id, blockHeight, matchState),
          randomnessGenerator
        )
      : [];
  const updateLobbyTuples = activateLobby(user, lobby, creator_role, matchState, blockHeight);
  const blankStatsTuple: SQLUpdate = blankStats(user);
  return [...updateLobbyTuples, blankStatsTuple, ...firstRound];
}

const constructRoundData = (
  lobbyId: string,
  blockHeight: number,
  matchState: MatchState
): IGetRoundDataResult => ({
  round_within_match: 0,
  lobby_id: lobbyId,
  starting_block_height: blockHeight,
  execution_block_height: null,
  id: 0,
  match_state: matchState as any,
});

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
  creator_faction: RoleSetting,
  matchState: MatchState,
  blockHeight: number
): SQLUpdate[] {
  const smParams: IStartMatchParams = {
    lobby_id: lobbyState.lobby_id,
    player_two: user,
    current_match_state: matchState as any, // TODO mmm
    creator_faction,
  };
  const newMatchTuple: SQLUpdate = [startMatch, smParams];
  const newRoundTuples = persistNewRound(
    lobbyState.lobby_id,
    0,
    lobbyState.round_length,
    matchState,
    blockHeight
  );
  // We insert the round and first two empty user states in their tables at this stage, so the round executor has empty states to iterate from.
  return [newMatchTuple, ...newRoundTuples];
}
