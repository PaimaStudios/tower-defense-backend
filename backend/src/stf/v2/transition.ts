import type { PoolClient } from 'pg';
import type Prando from '@paima/prando';
import {
  getAchievementProgress,
  getMainAddress,
  IGetAchievementProgressResult,
  ISetAchievementProgressParams,
  Json,
  setAchievementProgress,
  WalletDelegate,
  type SQLUpdate,
} from '@paima/db';
import type { WalletAddress } from '@paima/chain-types';
import type {
  IGetLobbyByIdResult,
  IGetRoundDataResult,
  IEndMatchParams,
  IAddNftScoreParams,
  IAddNftScoreWeekParams,
} from '@tower-defense/db';
import {
  getLobbyById,
  getRoundData,
  getUserStats,
  getMapLayout,
  getMatchConfig,
  endMatch,
  addNftScore,
  getLatestUserNft,
  getMatchSeeds,
  getMovesByLobby,
  getUserFinishedLobbies,
  getNftScore,
  addNftScoreWeek,
} from '@tower-defense/db';
import type {
  ClosedLobbyInput,
  CreatedLobbyInput,
  JoinedLobbyInput,
  RegisteredConfigInput,
  ScheduledDataInput,
  SetNFTInput,
  SubmittedTurnInput,
  UserStats,
  ZombieRound,
} from './types.js';
import { isWipeOldLobbies } from './types.js';
import { isUserStats, isZombieRound } from './types.js';
import type {
  MatchConfig,
  MatchExecutorData,
  MatchResults,
  MatchState,
  TurnAction,
} from '@tower-defense/utils';
import { configParser, iso8601YearAndWeek, maps, moveToAction } from '@tower-defense/utils';
import { PRACTICE_BOT_ADDRESS } from '@tower-defense/utils';
import processTick, {
  calculateMatchStats,
  generateMoves,
  generateRandomMoves,
  matchResults,
  MatchStats,
  parseConfig,
  validateMoves,
  winnerOf,
} from '@tower-defense/game-logic';
import { MatchExecutor, roundExecutor } from '@paima/executors';
import {
  persistCloseLobby,
  persistExecutedRound,
  persistLobbyCreation,
  persistLobbyJoin,
  persistMatchResults,
  persistMove,
  persistNFT,
  persistNewRound,
  persistPracticeLobbyCreation,
  persistStatsUpdate,
  persistUpdateMatchState,
  scheduleStatsUpdate,
  persistConfigRegistration,
} from './persist/index.js';
import { wipeOldLobbies } from './persist/wipe.js';
import { AchievementAmounts, AchievementNames } from '../../achievements.js';

export async function processCreateLobby(
  user: WalletAddress,
  blockHeight: number,
  blockTimestamp: Date,
  input: CreatedLobbyInput,
  randomnessGenerator: Prando,
  dbConn: PoolClient
): Promise<SQLUpdate[]> {
  const [creatorNft] = await getLatestUserNft.run({ wallet: user }, dbConn);
  const cdeName = creatorNft?.cde_name ?? null;
  const tokenId = creatorNft?.token_id ?? 0;

  if (input.isPractice) {
    const [map] = await getMapLayout.run({ name: input.map }, dbConn);
    if (!map) return [];
    const [configString] = await getMatchConfig.run({ id: input.matchConfigID }, dbConn);
    if (!configString) return [];
    const matchConfig = parseConfig(configString.content);
    return await persistPracticeLobbyCreation(
      dbConn,
      blockHeight,
      blockTimestamp,
      user,
      cdeName,
      tokenId,
      input,
      map,
      matchConfig,
      randomnessGenerator
    );
  }
  return persistLobbyCreation(blockHeight, user, cdeName, tokenId, input, randomnessGenerator);
}

export async function processJoinLobby(
  user: WalletAddress,
  blockHeight: number,
  blockTimestamp: Date,
  input: JoinedLobbyInput,
  randomnessGenerator: Prando,
  dbConn: PoolClient
): Promise<SQLUpdate[]> {
  const [lobbyState] = await getLobbyById.run({ lobby_id: input.lobbyID }, dbConn);
  // if Lobby doesn't exist, bail
  if (!lobbyState) return [];
  const [map] = await getMapLayout.run({ name: lobbyState.map }, dbConn);
  if (!map) return [];
  // if match config is not in the database, bail
  const [configString] = await getMatchConfig.run({ id: lobbyState.config_id }, dbConn);
  if (!configString) return [];
  const matchConfig = parseConfig(configString.content);
  const [joinerNft] = await getLatestUserNft.run({ wallet: user }, dbConn);
  return await persistLobbyJoin(
    dbConn,
    blockHeight,
    blockTimestamp,
    user,
    joinerNft?.cde_name,
    joinerNft?.token_id ?? 0,
    lobbyState,
    map,
    matchConfig,
    randomnessGenerator
  );
}

export async function processCloseLobby(
  user: WalletAddress,
  input: ClosedLobbyInput,
  dbConn: PoolClient
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

export async function practiceRound(
  db: PoolClient,
  blockHeight: number,
  blockTimestamp: Date,
  lobbyState: IGetLobbyByIdResult,
  matchConfig: MatchConfig,
  roundData: IGetRoundDataResult,
  randomnessGenerator: Prando
): Promise<SQLUpdate[]> {
  // updates that would've been done during persist.
  const newRound = roundData.round_within_match + 1;
  const newStartingBlockHeight = blockHeight;

  // structuredClone would be better but it requires node v17.
  const matchState = JSON.parse(JSON.stringify(roundData.match_state)) as unknown as MatchState;
  const user = PRACTICE_BOT_ADDRESS;
  const faction = user === matchState.defender ? 'defender' : 'attacker';
  const movesFunction = generateMoves[lobbyState.bot_difficulty];
  const moves = movesFunction(matchConfig, matchState, faction, newRound, randomnessGenerator);
  const movesTuples = moves.map(a => persistMove(lobbyState.lobby_id, user, a));
  const roundExecutionTuples = await executeRound(
    db,
    blockHeight,
    blockTimestamp,
    lobbyState,
    matchConfig,
    moves,
    {
      ...roundData,
      match_state: matchState as any,
      round_within_match: newRound,
      starting_block_height: newStartingBlockHeight,
    },
    randomnessGenerator
  );
  return [...movesTuples, ...roundExecutionTuples];
}

export async function processSubmittedTurn(
  blockHeight: number,
  blockTimestamp: Date,
  user: string,
  input: SubmittedTurnInput,
  randomnessGenerator: Prando,
  dbConn: PoolClient
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

  // Only one player submits moves per round.
  // First turn for each player is just for building.
  // After that, each round triggers a battle phase.
  // i.e. Defender submits moves -> Battle phase
  // then Attacker submits moves -> Annother battle phase.
  // Save the moves to the database;
  const movesTuples = input.actions.map(action => persistMove(lobby.lobby_id, user, action));
  // Execute the round after moves come in. Pass the moves in database params format to the round executor.
  const roundExecutionTuples = await executeRound(
    dbConn,
    blockHeight,
    blockTimestamp,
    lobby,
    matchConfig,
    input.actions,
    round,
    randomnessGenerator
  );
  const matchEnded =
    (round.match_state as any).defenderBase.health <= 0 ||
    lobby.current_round === lobby.num_of_rounds;
  if (lobby.practice && !matchEnded) {
    const practiceTuples = await practiceRound(
      dbConn,
      blockHeight,
      blockTimestamp,
      { ...lobby, current_round: lobby.current_round + 1 },
      matchConfig,
      round, // match state here should have been mutated by the previous round execution...
      randomnessGenerator
    );
    return [...movesTuples, ...roundExecutionTuples, ...practiceTuples];
  }
  return [...movesTuples, ...roundExecutionTuples];
}

export async function processScheduledData(
  input: ScheduledDataInput,
  blockHeight: number,
  blockTimestamp: Date,
  randomnessGenerator: Prando,
  dbConn: PoolClient
): Promise<SQLUpdate[]> {
  if (isZombieRound(input)) {
    return processZombieEffect(input, blockHeight, blockTimestamp, randomnessGenerator, dbConn);
  }
  if (isUserStats(input)) {
    return processStatsEffect(input, dbConn);
  }
  if (isWipeOldLobbies(input)) return [wipeOldLobbies(input.days)];
  return [];
}

export async function processZombieEffect(
  input: ZombieRound,
  blockHeight: number,
  blockTimestamp: Date,
  randomnessGenerator: Prando,
  dbConn: PoolClient
): Promise<SQLUpdate[]> {
  const [lobby] = await getLobbyById.run({ lobby_id: input.lobbyID }, dbConn);
  if (!lobby) return [];
  if (!lobby.player_two) {
    console.error(`Lobby ${lobby.lobby_id} is missing a player two. Skipping zombie round.`);
    return [];
  }

  const [round] = await getRoundData.run(
    { lobby_id: lobby.lobby_id, round_number: lobby.current_round },
    dbConn
  );
  if (!round) return [];
  const [configString] = await getMatchConfig.run({ id: lobby.config_id }, dbConn);
  if (!configString) return [];
  const matchConfig = parseConfig(configString.content);

  console.log(
    `Executing ${lobby.autoplay ? 'autoplay' : ''} zombie round (#${
      lobby.current_round
    }) for lobby ${lobby.lobby_id}`
  );
  const faction = round.round_within_match % 2 === 0 ? 'attacker' : 'defender';
  const user = faction === lobby.creator_faction ? lobby.lobby_creator : lobby.player_two;
  const moves = lobby.autoplay
    ? generateRandomMoves(
        matchConfig,
        round.match_state as any as MatchState,
        faction,
        round.round_within_match,
        randomnessGenerator
      )
    : [];
  const movesTuples = moves.map(action => persistMove(lobby.lobby_id, user, action));

  // Proceed to the next round
  const roundExecutionTuples = await executeRound(
    dbConn,
    blockHeight,
    blockTimestamp,
    lobby,
    matchConfig,
    moves,
    round,
    randomnessGenerator
  );
  const matchEnded =
    (round.match_state as any).defenderBase.health <= 0 ||
    lobby.current_round === lobby.num_of_rounds;
  const practiceTuples =
    lobby.practice && !matchEnded
      ? await practiceRound(
          dbConn,
          blockHeight,
          blockTimestamp,
          { ...lobby, current_round: lobby.current_round + 1 },
          matchConfig,
          round, // match state here should have been mutated by the previous round execution...
          randomnessGenerator
        )
      : [];
  return [...movesTuples, ...roundExecutionTuples, ...practiceTuples];
}

export async function processStatsEffect(
  input: UserStats,
  dbConn: PoolClient
): Promise<SQLUpdate[]> {
  const [stats] = await getUserStats.run({ wallet: input.user }, dbConn);
  if (!stats) return [];
  const query = persistStatsUpdate(input.user, input.result, stats);
  return [query];
}

// Runs the 'round executor' and produces the necessary SQL updates as a result
export async function executeRound(
  db: PoolClient,
  blockHeight: number,
  blockTimestamp: Date,
  lobby: IGetLobbyByIdResult,
  matchConfig: MatchConfig,
  moves: TurnAction[],
  roundData: IGetRoundDataResult,
  randomnessGenerator: Prando
): Promise<SQLUpdate[]> {
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
  const executedRoundUpdate = persistExecutedRound(
    roundData.starting_block_height,
    lobby,
    blockHeight
  );

  // Finalize match if defender dies or we've reached the final round
  const matchEnded =
    newState.defenderBase.health <= 0 || lobby.current_round === lobby.num_of_rounds;
  if (matchEnded) {
    console.log(newState.defenderBase.health, 'match ended, finalizing');
    const finalizeMatchTuples: SQLUpdate[] = await finalizeMatch(
      db,
      blockHeight,
      blockTimestamp,
      lobby,
      newState
    );
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

// Finalizes the match and updates user statistics according to final score of the match
async function finalizeMatch(
  db: PoolClient,
  blockHeight: number,
  blockTimestamp: Date,
  lobby: IGetLobbyByIdResult,
  matchState: MatchState
): Promise<SQLUpdate[]> {
  const updates: SQLUpdate[] = [];

  updates.push([
    endMatch,
    {
      lobby_id: lobby.lobby_id,
      current_match_state: matchState as any,
    } satisfies IEndMatchParams,
  ]);

  const results = matchResults(lobby, matchState);

  if (lobby.practice) {
    // A practice lobby is still good for win_first_match, but not the rest.
    if (results[0].result === 'win') {
      const main = await getMainAddress(results[0].wallet, db);
      updates.push([
        setAchievementProgress,
        {
          wallet: main.id,
          name: AchievementNames.win_first_match,
          completed_date: new Date(),
        } satisfies ISetAchievementProgressParams,
      ]);
    }

    return updates;
  }
  // After here, not a practice lobby.

  updates.push(persistMatchResults(lobby.lobby_id, results, matchState));

  // Compute match stats for achievement use.
  const executor = await getMatchExecutor(db, lobby);
  const stats: MatchStats = calculateMatchStats(executor);
  const mains = [
    await getMainAddress(results[0].wallet, db),
    await getMainAddress(results[1].wallet, db),
  ];

  // Handle achievement progress and awarding for the winner.
  if (results[0].result === 'win') {
    updates.push(
      ...(await wonGameAchievements(db, lobby, matchState, results[0], mains[0], stats.p1GoldSpent))
    );
  } else if (results[1].result === 'win') {
    updates.push(
      ...(await wonGameAchievements(db, lobby, matchState, results[1], mains[1], stats.p2GoldSpent))
    );
  }

  // For both winner and loser, handle all-time progressive achievements.
  for (let i = 0; i < 2; ++i) {
    const map = await fetchProgress(db, mains[i].id, [
      AchievementNames.ranked_destroy_towers,
      AchievementNames.ranked_kill_undead,
    ]);

    let nft;
    if (results[i].wallet === matchState.attacker) {
      nft = { cde_name: matchState.attackerCdeName, token_id: String(matchState.attackerTokenId) };
      if (nft && matchState.defenderTokenId) {
        // Parrot Patton
        // Attacker gets credit for towers destroyed with Macaws.
        const prog = getProgress(mains[i].id, map, AchievementNames.ranked_destroy_towers);
        prog.progress = (prog.progress ?? 0) + stats.towersDestroyed;
        prog.total = AchievementAmounts.ranked_destroy_towers;
        if (prog.progress >= prog.total) {
          prog.completed_date = new Date();
        }
        updates.push([setAchievementProgress, prog satisfies ISetAchievementProgressParams]);
      }
    } else if (results[i].wallet === matchState.defender) {
      nft = { cde_name: matchState.defenderCdeName, token_id: String(matchState.defenderTokenId) };
      if (nft && matchState.attackerTokenId) {
        // Hold The Line!
        // Defender gets credit for undead killed.
        const prog = getProgress(mains[i].id, map, AchievementNames.ranked_kill_undead);
        prog.progress = (prog.progress ?? 0) + stats.unitsDestroyed;
        prog.total = AchievementAmounts.ranked_kill_undead;
        if (prog.progress >= prog.total) {
          prog.completed_date = new Date();
        }
        updates.push([setAchievementProgress, prog satisfies ISetAchievementProgressParams]);
      }
    }

    // Tropical Trooper
    if (nft) {
      const nftScore = await getNftScore.run(nft, db);
      if (nftScore.length > 0 && nftScore[0].wins + nftScore[0].losses === 24) {
        // wins + losses *was* 24, so this is the 25th finished game, so award.
        // Effectively the achievement goes to the owner of the NFT at the time
        // of its 25th win, so this achievement can only be awarded once per NFT
        // that exists.
        updates.push([
          setAchievementProgress,
          {
            wallet: mains[i].id,
            name: AchievementNames.ranked_games_played,
            completed_date: new Date(),
          } satisfies ISetAchievementProgressParams,
        ]);
      }
    }
  }

  // Create the new scheduled data for updating user stats
  const week = iso8601YearAndWeek(blockTimestamp);
  updates.push(
    scheduleStatsUpdate(results[0].wallet, results[0].result, blockHeight + 1),
    scheduleStatsUpdate(results[1].wallet, results[1].result, blockHeight + 1)
  );
  if (results[0].cdeName) {
    updates.push(
      [
        addNftScore,
        {
          cde_name: results[0].cdeName,
          token_id: String(results[0].tokenId),
          wins: results[0].result === 'win' ? 1 : 0,
          losses: results[0].result === 'loss' ? 1 : 0,
        } satisfies IAddNftScoreParams,
      ],
      [
        addNftScoreWeek,
        {
          cde_name: results[0].cdeName,
          token_id: String(results[0].tokenId),
          week,
          wins: results[0].result === 'win' ? 1 : 0,
          losses: results[0].result === 'loss' ? 1 : 0,
        } satisfies IAddNftScoreWeekParams,
      ]
    );
  }
  if (results[1].cdeName) {
    updates.push(
      [
        addNftScore,
        {
          cde_name: results[1].cdeName,
          token_id: String(results[1].tokenId),
          wins: results[1].result === 'win' ? 1 : 0,
          losses: results[1].result === 'loss' ? 1 : 0,
        } satisfies IAddNftScoreParams,
      ],
      [
        addNftScoreWeek,
        {
          cde_name: results[1].cdeName,
          token_id: String(results[1].tokenId),
          week,
          wins: results[1].result === 'win' ? 1 : 0,
          losses: results[1].result === 'loss' ? 1 : 0,
        } satisfies IAddNftScoreWeekParams,
      ],
    );
  }

  return updates;
}

// Evil copy-pasta from /api/src/controllers/matchExecutor.ts
async function getMatchExecutor(
  pool: PoolClient,
  lobby: IGetLobbyByIdResult
): Promise<MatchExecutorData> {
  const [config] = await getMatchConfig.run({ id: lobby.config_id }, pool);
  const configString = config.content;
  const rounds = await getMatchSeeds.run({ lobby_id: lobby.lobby_id }, pool);
  const seeds = rounds.map(r => {
    return {
      seed: r.seed,
      block_height: r.block_height,
      round: r.round_within_match,
    };
  });
  const initialState = rounds.find(r => r.round_within_match === 1)
    ?.match_state as unknown as MatchState;
  const dbMoves = await getMovesByLobby.run({ lobby_id: lobby.lobby_id }, pool);
  const moves = dbMoves.map(m => moveToAction(m, initialState.attacker));
  return { lobby, configString, seeds, initialState, moves };
}

export async function processConfig(
  user: WalletAddress,
  input: RegisteredConfigInput,
  randomnessGenerator: Prando
): Promise<SQLUpdate[]> {
  const parsedConfig = configParser(input.content);
  if ('error' in parsedConfig) return [];
  else return [persistConfigRegistration(user, input, randomnessGenerator)];
}

// Covers achievements that have "Win" as a condition.
// General progression/"grinding" achievements are handled where they are.
async function wonGameAchievements(
  db: PoolClient,
  lobby: IGetLobbyByIdResult,
  matchState: MatchState,
  winner: MatchResults[0],
  main: WalletDelegate,
  goldSpent: number
): Promise<SQLUpdate[]> {
  const updates: SQLUpdate[] = [];

  // Welcome to the Jungle
  updates.push([
    setAchievementProgress,
    {
      wallet: main.id,
      name: AchievementNames.win_first_match,
      completed_date: new Date(),
    } satisfies ISetAchievementProgressParams,
  ]);

  // The Best Defense
  if (winner.wallet === matchState.defender && matchState.defenderBase.health >= 25 / 2) {
    updates.push([
      setAchievementProgress,
      {
        wallet: main.id,
        name: AchievementNames.defend_with_half_hp,
      } satisfies ISetAchievementProgressParams,
    ]);
  }

  // Like Undead Lightning
  if (winner.wallet === matchState.attacker && lobby.current_round < lobby.num_of_rounds) {
    updates.push([
      setAchievementProgress,
      {
        wallet: main.id,
        name: AchievementNames.attack_before_final_round,
      } satisfies ISetAchievementProgressParams,
    ]);
  }

  // Ranked achievements are NFT vs NFT only:
  // NFT vs NFT: matchState.attackerTokenId && matchState.defenderTokenId
  // Winner has NFT: winner.wallet === matchState.attacker ? matchState.attackerTokenId : matchState.defenderTokenId
  if (matchState.attackerTokenId && matchState.defenderTokenId) {
    // Rope Ladder Climber
    updates.push([
      setAchievementProgress,
      {
        wallet: main.id,
        name: AchievementNames.ranked_win,
        completed_date: new Date(),
      } satisfies ISetAchievementProgressParams,
    ]);

    // Combat Conservationist
    if (goldSpent < AchievementAmounts.ranked_spend_less_gold) {
      updates.push([
        setAchievementProgress,
        {
          wallet: main.id,
          name: AchievementNames.ranked_spend_less_gold,
          completed_date: new Date(),
        } satisfies ISetAchievementProgressParams,
      ]);
    }

    // Get all finished lobbies, recent first.
    let finished = await getUserFinishedLobbies.run(
      {
        wallet: main.address,
      },
      db
    );
    // Filter to ranked games only.
    finished = finished.filter(l => {
      let ms = l.current_match_state as unknown as MatchState;
      return ms.attackerTokenId && ms.defenderTokenId;
    });
    // Sneak ours in at the front.
    finished.splice(0, 0, { ...lobby, current_match_state: matchState as unknown as Json });

    // Mask Trick
    if (finished.slice(0, 3).every(lobby => winnerOf(lobby) === main.address)) {
      updates.push([
        setAchievementProgress,
        {
          wallet: main.id,
          name: AchievementNames.ranked_three_in_a_row,
          completed_date: new Date(),
        } satisfies ISetAchievementProgressParams,
      ]);
    }

    // Jungle World Tour
    const uniques = new Set();
    for (const finishedLobby of finished) {
      const map = finishedLobby.map;
      const position = selectFaction(finishedLobby, main.address);
      uniques.add(`${map}_${position}`);
    }
    const total = 2 * 8; // maps.length is 12 but 4 are unused, so 8 real maps
    updates.push([
      setAchievementProgress,
      {
        wallet: main.id,
        name: AchievementNames.ranked_win_every_position,
        completed_date: uniques.size >= total ? new Date() : null,
        progress: uniques.size,
        total,
      } satisfies ISetAchievementProgressParams,
    ]);
  }

  return updates;
}

async function fetchProgress<Names extends string>(db: PoolClient, wallet: number, names: Names[]) {
  return Object.fromEntries(
    (
      await getAchievementProgress.run(
        {
          wallet,
          names,
        },
        db
      )
    ).map(x => [x.name, x])
  ) as { [x in Names]: IGetAchievementProgressResult | undefined };
}

function getProgress<Name extends string>(
  wallet: number,
  map: Record<Name, IGetAchievementProgressResult | undefined>,
  name: Name
): IGetAchievementProgressResult {
  return (
    map[name] ?? {
      name,
      completed_date: null,
      progress: null,
      total: null,
      wallet,
    }
  );
}

function selectFaction(lobby: IGetLobbyByIdResult, wallet: string): 'attacker' | 'defender' {
  if (wallet === lobby.lobby_creator) {
    if (lobby.creator_faction === 'random') {
      console.error('selectFaction', lobby, wallet);
      throw new Error('selectFaction: cannot accept still-random lobbies');
    }
    return lobby.creator_faction;
  } else if (wallet === lobby.player_two) {
    if (lobby.creator_faction === 'attacker') {
      return 'defender';
    } else if (lobby.creator_faction === 'defender') {
      return 'attacker';
    } else {
      console.error('selectFaction', lobby, wallet);
      throw new Error('selectFaction: cannot accept still-random lobbies');
    }
  } else {
    console.error('selectFaction', lobby, wallet);
    throw new Error('selectFaction: asked for faction of non-participant');
  }
}
