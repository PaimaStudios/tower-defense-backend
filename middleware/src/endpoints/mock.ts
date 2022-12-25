import { buildEndpointErrorFxn, CatapultMiddlewareErrorCode } from '../errors';
import {
  AccountNftsData,
  FailedResult,
  LobbyState,
  LobbyStates,
  MatchExecutorData,
  NewLobbies,
  NFT,
  PackedLobbyState,
  PackedRoundExecutionState,
  PackedUserStats,
  RoundEnd,
  RoundExecutor,
  RoundExecutorData,
  RoundStatusData,
  SuccessfulResult,
  UserStats,
} from '../types';
import type { MatchConfig } from '@tower-defense/utils';
import { annotateMap, testmap, setPath, build, getFirstRound, getNewRound } from './mock-helpers';

async function getUserStats(walletAddress: string): Promise<PackedUserStats | FailedResult> {
  // const errorFxn = buildEndpointErrorFxn("getUserStats");
  return {
    success: true,
    stats: {
      wallet: walletAddress,
      wins: 666,
      losses: 10,
    },
  };
}

const myOpenLobby = {
  lobby_id: 'abcdefabcdef',
  created_at: new Date(),
  lobby_creator: '0xdDA309096477b89D7066948b31aB05924981DF2B',
  creator_faction: 'attacker',
  player_two: null,
  player_two_faction: null,
  current_round: 1,
  num_of_rounds: 100,
  map: 'jungle',
  health: 100,
  spawnLimit: 10,
  creation_block_height: 1,
  round_start_height: 2,
  lobby_state: 'open',
  round_length: 500,
  round_ends_in_blocks: 100,
  round_ends_in_secs: 400,
  initial_gold: 1000,
};
const myActiveLobby = {
  lobby_id: 'defdefabcabc',
  created_at: new Date(),
  lobby_creator: '0xdDA309096477b89D7066948b31aB05924981DF2B',
  creator_faction: 'defender',
  player_two: '0xcede5F9E2F8eDa3B6520779427AF0d052B106B57',
  player_two_faction: 'attacker',
  current_round: 3,
  num_of_rounds: 10,
  map: 'jungle',
  health: 100,
  spawnLimit: 10,
  creation_block_height: 1,
  round_start_height: 2,
  lobby_state: 'active',
  round_length: 500,
  round_ends_in_blocks: 100,
  round_ends_in_secs: 400,
  player_turn: '0xdDA309096477b89D7066948b31aB05924981DF2B',
  initial_gold: 2000,
};
async function getLobbyState(lobbyID: string): Promise<PackedLobbyState | FailedResult> {
  // const errorFxn = buildEndpointErrorFxn("getLobbyState");
  const lobby =
    lobbyID === 'abcdefabcdef' ? myOpenLobby : lobbyID === 'defdefabcabc' ? myActiveLobby : null;
  if (lobby)
    return {
      success: true,
      lobby,
    };
  else
    return {
      success: false,
      message: 'lobby does not exist',
    };
}

async function getRandomOpenLobby(): Promise<PackedLobbyState | FailedResult> {
  return {
    success: true,
    lobby: {
      lobby_id: 'abcdefabcdef',
      created_at: new Date(),
      lobby_creator: '0xdDA309096477b89D7066948b31aB05924981DF2B',
      creator_faction: 'attacker',
      player_two: null,
      player_two_faction: null,
      current_round: 1,
      num_of_rounds: 100,
      map: 'jungle',
      health: 100,
      spawnLimit: 10,
      creation_block_height: 1,
      round_start_height: 2,
      lobby_state: 'open',
      round_length: 500,
      round_ends_in_blocks: 100,
      round_ends_in_secs: 400,
      initial_gold: 1000,
    },
  };
}

async function getOpenLobbies(page: number, count?: number): Promise<LobbyStates | FailedResult> {
  return {
    success: true,
    lobbies: [
      {
        lobby_id: 'abcdefabcdef',
        created_at: new Date(),
        lobby_creator: '0xdDA309096477b89D7066948b31aB05924981DF2B',
        creator_faction: 'attacker',
        player_two: null,
        player_two_faction: null,
        current_round: 1,
        num_of_rounds: 100,
        map: 'jungle',
        health: 100,
        spawnLimit: 10,
        creation_block_height: 1,
        round_start_height: 2,
        lobby_state: 'open',
        round_length: 500,
        round_ends_in_blocks: 100,
        round_ends_in_secs: 400,
        initial_gold: 1000,
      },
    ],
  };
}
async function getUserLobbiesMatches(
  walletAddress: string,
  page: number,
  count?: number
): Promise<LobbyStates | FailedResult> {
  return {
    success: true,
    lobbies: [
      {
        lobby_id: 'abcdefabcdef',
        created_at: new Date(),
        lobby_creator: '0xdDA309096477b89D7066948b31aB05924981DF2B',
        creator_faction: 'attacker',
        player_two: null,
        player_two_faction: null,
        current_round: 1,
        num_of_rounds: 100,
        map: 'jungle',
        health: 100,
        spawnLimit: 10,
        creation_block_height: 1,
        round_start_height: 2,
        lobby_state: 'open',
        round_length: 500,
        round_ends_in_blocks: 100,
        round_ends_in_secs: 400,
        initial_gold: 1000,
      },
      {
        lobby_id: 'defdefabcabc',
        created_at: new Date(),
        lobby_creator: '0xdDA309096477b89D7066948b31aB05924981DF2B',
        creator_faction: 'defender',
        player_two: '0xcede5F9E2F8eDa3B6520779427AF0d052B106B57',
        player_two_faction: 'attacker',
        current_round: 3,
        num_of_rounds: 10,
        map: 'jungle',
        health: 100,
        spawnLimit: 10,
        creation_block_height: 1,
        round_start_height: 2,
        lobby_state: 'active',
        round_length: 500,
        round_ends_in_blocks: 100,
        round_ends_in_secs: 400,
        player_turn: '0xdDA309096477b89D7066948b31aB05924981DF2B',
        initial_gold: 2000,
      },
    ],
  };
}
async function getNewLobbies(
  wallet: string,
  blockHeight: number
): Promise<NewLobbies | FailedResult> {
  return {
    success: true,
    lobbies: [{ lobby_id: 'deadbeefdead' }, { lobby_id: 'deadbeefdeaf' }],
  };
}
async function getUserSetNFT(wallet: string): Promise<SuccessfulResult<NFT> | FailedResult> {
  return {
    success: true,
    result: {
      title: 'NFT',
      imageUrl: `https://pbs.twimg.com/profile_images/1557038736218722304/vnXi5VbL_400x400.jpg`,
      nftAddress: '0xcede5F9E2F8eDa3B6520779427AF0d052B106B57',
      tokenId: 1,
    },
  };
}
async function getUserWalletNfts(address: string): Promise<SuccessfulResult<NFT[]> | FailedResult> {
  return {
    success: true,
    result: [
      {
        title: 'NFT',
        imageUrl: `https://pbs.twimg.com/profile_images/1557038736218722304/vnXi5VbL_400x400.jpg`,
        nftAddress: '0xcede5F9E2F8eDa3B6520779427AF0d052B106B57',
        tokenId: 1,
      },
      {
        title: 'NFT2',
        imageUrl: `https://www.nftsstreet.com/wp-content/uploads/2021/04/cryptopunk7804.png`,
        nftAddress: '0xcede5F9E2F8eDa3B6520779427AF0d052B106B57',
        tokenId: 2,
      },
    ],
  };
}
async function getLatestProcessedBlockHeight(): Promise<SuccessfulResult<number> | FailedResult> {
  return {
    success: true,
    result: 666,
  };
}
async function getRoundExecutionState(
  lobbyID: string,
  round: number
): Promise<PackedRoundExecutionState | FailedResult> {
  return {
    success: true,
    round: {
      executed: false,
      usersWhoSubmittedMoves: ['0xdDA309096477b89D7066948b31aB05924981DF2B'],
      roundEndsInBlocks: 100,
      roundEndsInSeconds: 400,
    },
  };
}
async function getRoundExecutor(
  lobbyId: string,
  roundNumber: number
): Promise<SuccessfulResult<RoundExecutor> | FailedResult> {
  const executor = roundNumber === 1 ? getFirstRound() : getNewRound(roundNumber);
  return {
    success: true,
    result: executor,
  };
}
// async function getMatchExecutor(
//   lobbyId: string
// ): Promise<SuccessfulResult<typeof MatchExecutor> | FailedResult> {
//   const seeds = [
//     { round: 1, block_height: 0, seed: 'td' },
//     { round: 2, block_height: 0, seed: 'td2' },
//     { round: 3, block_height: 0, seed: 'td3' },
//     { round: 4, block_height: 0, seed: 'td4' },
//   ];
//   const configString = 'r|1|gr;d;105|st;h150;c10;d5;r2'; // we would get this from the db in production
//   const matchConfig: MatchConfig = parseConfig(configString);
//   const am = annotateMap(testmap, 22);
//   const withPath = setPath(am);
//   const initialMatchState = {
//     width: 22,
//     height: 13,
//     defender: '0xdDA309096477b89D7066948b31aB05924981DF2B',
//     attacker: '0xcede5F9E2F8eDa3B6520779427AF0d052B106B57',
//     defenderGold: 100,
//     attackerGold: 100,
//     defenderBase: { health: 100, level: 1 },
//     attackerBase: { level: 1 },
//     actors: {
//       towers: {},
//       crypts: {},
//       units: {},
//     },
//     contents: withPath,
//     mapState: withPath.flat(),
//     name: 'jungle',
//     currentRound: 1,
//     actorCount: 2,
//   };
//   const moves = build(3, 3);
//   const executor = MatchExecutor.initialize(
//     matchConfig,
//     5,
//     );
//   return {
//     success: true,
//     result: executor,
//   };
// }

async function userWalletLogin() {
  return {
    success: true,
    walletAddress: '0xdDA309096477b89D7066948b31aB05924981DF2B',
  };
}
async function createLobby() {
  return {
    success: true,
    lobbyID: 'abcdefabcdef',
    lobbyStatus: 'open',
  };
}
async function joinLobby(lobbyID: string) {
  return {
    success: true,
    message: '',
  };
}
export const mockEndpoints = {
  getUserStats,
  getLobbyState,
  getRandomOpenLobby,
  getOpenLobbies,
  getUserLobbiesMatches,
  getUserWalletNfts,
  getLatestProcessedBlockHeight,
  getNewLobbies,
  getUserSetNFT,
  getRoundExecutor,
  // getMatchExecutor,
  getRoundExecutionState,
  userWalletLogin,
  createLobby,
  joinLobby,
};
