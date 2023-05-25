import type { FailedResult } from 'paima-engine/paima-mw-core';
import type {
  ContractAddress,
  Hash,
  LobbyStatus,
  MapName,
  MatchConfig,
  URI,
} from '@tower-defense/utils';
import type { WalletAddress } from 'paima-engine/paima-utils';

export interface MiddlewareConnectionDetails {
  storageAddress: ContractAddress;
  backendUri: URI;
  indexerUri: URI;
  statefulUri: URI;
  batcherUri: URI;
}

export interface MiddlewareConfig extends MiddlewareConnectionDetails {
  localVersion: string;
}

export interface SuccessfulResultMessage {
  success: true;
  message: string;
}

export interface SuccessfulResult<T> {
  success: true;
  result: T;
}

export interface RoundEnd {
  blocks: number;
  seconds: number;
}

export type Result<T> = SuccessfulResult<T> | FailedResult;
export type OldResult = SuccessfulResultMessage | FailedResult;

interface BaseResponse {
  success: true;
}

interface CreateLobbySuccessfulResponse extends BaseResponse {
  lobbyID: Hash;
  lobbyStatus: LobbyStatus;
}

export type CreateLobbyResponse = CreateLobbySuccessfulResponse | FailedResult;

export interface NewLobby {
  lobby_id: Hash;
}

export interface NewLobbies extends BaseResponse {
  lobbies: NewLobby[];
}

export interface NftId {
  nftAddress: ContractAddress;
  tokenId: number;
}

export interface NFT {
  title: string;
  imageUrl: URI;
  nftAddress: ContractAddress;
  tokenId: number;
}

export interface BasicLobbyInfo {
  lobby_id: Hash;
  health: number;
  num_of_rounds: number;
  current_round: number;
  round_length: number;
  round_start_height: number;
  map: MapName;
  created_at: string;
  creation_block_height: number;
  lobby_creator: WalletAddress;
  player_two: WalletAddress;
  round_ends_in_blocks: number;
  round_ends_in_secs: number;
}

export interface LobbyState extends BasicLobbyInfo {
  lobby_state: LobbyStatus;
}

export interface PackedLobbyState extends BaseResponse {
  lobby: LobbyState;
}

export interface PackedLobbyResponse extends BaseResponse {
  lobby: LobbyState | null;
}

export interface LobbyResponse {
  lobby: LobbyState | null;
}

export interface PackedLobbyConfig extends BaseResponse {
  result: {
    config: MatchConfig;
  };
}
export interface PackedCurrentRound extends BaseResponse {
  result: {
    currentRound: number;
    roundStartHeight: number;
  };
}

export interface LobbyStates extends BaseResponse {
  lobbies: LobbyState[];
}

export interface UserStats {
  wallet: WalletAddress;
  wins: number;
  losses: number;
}

export interface PackedUserStats extends BaseResponse {
  stats: UserStats;
}

export interface AccountNftsResult {
  metadata: {
    name: string;
    image: URI;
  };
  contract: ContractAddress;
  tokenId: number;
}

export interface AccountNftsData {
  pages: number;
  totalItems: number;
  result: AccountNftsResult[];
}

export type NftScore = {
  nftContract: string;
  tokenId: number;
  totalGames: number;
  wins: number;
  losses: number;
  draws: number;
  score: number;
};

export type NftScoreSnake = {
  nft_contract: string;
  token_id: number;
  total_games: number;
  wins: number;
  losses: number;
  draws: number;
  score: number;
};

export interface MatchWinnerResponse {
  match_status: LobbyStatus;
  winner_address: string;
  p1StructuresBuilt: number;
  p2StructuresBuilt: number;
  unitsDestroyed: number;
  unitsSpawned: number;
  p1GoldSpent: number;
  p2GoldSpent: number;
}
export interface MapByNameResponse {
  map_layout: string;
}
