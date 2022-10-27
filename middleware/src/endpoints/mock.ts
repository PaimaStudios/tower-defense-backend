import {
  MatchExecutor as MatchExecutorConstructor,
  RoundExecutor as RoundExecutorConstructor,
} from "executors";

import { buildEndpointErrorFxn, CatapultMiddlewareErrorCode } from "../errors";
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
} from "../types";
import type { MatchConfig } from "td-utils";
import Prando from "prando";
import { annotateMap, testmap, setPath, build } from "./mock-helpers";
import processTick from "game-logic";

async function getUserStats(
  walletAddress: string
): Promise<PackedUserStats | FailedResult> {
  // const errorFxn = buildEndpointErrorFxn("getUserStats");
  return {
    success: true,
    stats: {
      wallet: walletAddress,
      wins: 666,
      losses: 10,
      ties: 10
    }
  }
}

async function getLobbyState(
  lobbyID: string
): Promise<PackedLobbyState | FailedResult> {
  // const errorFxn = buildEndpointErrorFxn("getLobbyState");
  return {
    success: true,
    lobby: {
      lobby_id: lobbyID,
      created_at: new Date(),
      lobby_creator: "0x1",
      player_two: "0x2",
      current_round: 1,
      num_of_rounds: 100,
      map: "jungle",
      health: 100,
      spawnLimit: 10,
      creation_block_height: 1,
      round_start_height: 2,
      lobby_state: "open"
    }
  }
}

async function getRandomOpenLobby(): Promise<PackedLobbyState | FailedResult> {
  return {
    success: true,
    lobby: {
      lobby_id: "abcdefabcdef",
      created_at: new Date(),
      lobby_creator: "0x1",
      player_two: "0x2",
      current_round: 1,
      num_of_rounds: 100,
      map: "jungle",
      health: 100,
      spawnLimit: 10,
      creation_block_height: 1,
      round_start_height: 2,
      lobby_state: "open"
    }
  }
}

async function getOpenLobbies(
  page: number,
  count?: number
): Promise<LobbyStates | FailedResult> {
  return {
    success: true,
    lobbies: [{
      lobby_id: "abcdefabcdef",
      created_at: new Date(),
      lobby_creator: "0x1",
      player_two: "0x2",
      current_round: 1,
      num_of_rounds: 100,
      map: "jungle",
      health: 100,
      spawnLimit: 10,
      creation_block_height: 1,
      round_start_height: 2,
      lobby_state: "open"
    }]
  }
}
async function getUserLobbiesMatches(
  walletAddress: string,
  page: number,
  count?: number
): Promise<LobbyStates | FailedResult> {
  return {
    success: true,
    lobbies:
      [
        {
          lobby_id: "abcdefabcdef",
          created_at: new Date(),
          lobby_creator: "0x1",
          player_two: "0x2",
          current_round: 1,
          num_of_rounds: 100,
          map: "jungle",
          health: 100,
          spawnLimit: 10,
          creation_block_height: 1,
          round_start_height: 2,
          lobby_state: "open"
        }
      ]
  }
}
async function getNewLobbies(
  wallet: string,
  blockHeight: number
): Promise<NewLobbies | FailedResult> {
  return {
    success: true,
    lobbies: [
      { lobby_id: "deadbeef" },
      { lobby_id: "deadmutton" }
    ]
  }
}
async function getUserSetNFT(
  wallet: string
): Promise<SuccessfulResult<NFT> | FailedResult> {
  return {
    success: true,
    result: {
      title: "NFT",
      imageUrl: `https://pbs.twimg.com/profile_images/1557038736218722304/vnXi5VbL_400x400.jpg`,
      nftAddress: "0x1",
      tokenId: 1
    }
  }
}
async function getUserWalletNfts(
  address: string
): Promise<SuccessfulResult<NFT[]> | FailedResult> {
  return {
    success: true,
    result: [
      {
        title: "NFT",
        imageUrl: `https://pbs.twimg.com/profile_images/1557038736218722304/vnXi5VbL_400x400.jpg`,
        nftAddress: "0x1",
        tokenId: 1
      },
      {
        title: "NFT2",
        imageUrl: `https://www.nftsstreet.com/wp-content/uploads/2021/04/cryptopunk7804.png`,
        nftAddress: "0x1",
        tokenId: 2
      }
    ]
  }
}
async function getLatestProcessedBlockHeight(): Promise<
  SuccessfulResult<number> | FailedResult
> {
  return {
    success: true,
    result: 666
  }
}
async function getRoundExecutionState(
  lobbyID: string,
  round: number
): Promise<PackedRoundExecutionState | FailedResult> {
  return {
    success: true,
    round: {
      executed: false,
      usersWhoSubmittedMoves: ["0x0"],
      roundEndsInBlocks: 100,
      roundEndsInSeconds: 400
    }
  }
}
async function getRoundExecutor(
  lobbyId: string,
  roundNumber: number
): Promise<SuccessfulResult<RoundExecutor> | FailedResult> {
  // const executor = RoundExecutor.initialize(matchEnvironment, playerStates, randomizedInputs, randomnessGenerator, processTick);
  const seed = "td";
  const rng = new Prando(seed);
  const matchConfig: MatchConfig = { something: "something" };
  const am = annotateMap(testmap, 22);
  const withPath = setPath(am);
  const matchState = {
    width: 22,
    height: 13,
    defender: "0x0",
    attacker: "0x1",
    defenderGold: 100,
    attackerGold: 100,
    defenderBase: { health: 100, level: 1 },
    attackerBase: { level: 1 },
    actors: {
      towers: {},
      crypts: {},
      units: {}
    },
    contents: withPath,
    name: "jungle",
    currentRound: 1
  };
  const moves = build(20, 10);
  const executor = RoundExecutorConstructor.initialize(matchConfig, matchState, moves, rng, processTick);
  return {
    success: true,
    result: executor
  }
}
// async function getMatchExecutor(): Promise<SuccessfulResult<typeof RoundExecutor> | FailedResult> {
//   const executor = MatchExecutor.initialize()
//   return{
//     success: true,
//     result: executor
//   }
// }
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
}