import type { FailedResult } from 'paima-engine/paima-mw-core';
import type {
  ContractAddress,
  Hash,
  LobbyStatus,
  MapName,
  MatchConfig,
  MatchState,
  TurnAction,
  URI,
} from '@tower-defense/utils';
import { WalletAddress } from 'paima-engine/paima-utils';

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

interface CreateLobbySuccessfulResponse {
  success: true;
  lobbyID: Hash;
  lobbyStatus: LobbyStatus;
}

export type CreateLobbyResponse = CreateLobbySuccessfulResponse | FailedResult;

export interface NewLobby {
  lobby_id: Hash;
}

export interface NewLobbies {
  success: true;
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

export interface PackedLobbyState {
  success: true;
  lobby: LobbyState;
}

export interface PackedLobbyConfig {
  success: true;
  result: {
    config: MatchConfig;
  };
}
export interface PackedCurrentRound {
  success: true;
  result: {
    currentRound: number;
    roundStartHeight: number;
  };
}

export interface RichOpenLobbyStates {
  success: true;
  lobbies: RichOpenLobbyState[];
}

export interface LobbyStates {
  success: true;
  lobbies: LobbyState[];
}

export interface UserStats {
  wallet: WalletAddress;
  wins: number;
  losses: number;
}

export interface PackedUserStats {
  success: true;
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

interface PlayerState {
  wallet: string;
  health: number;
  position: number;
}

export interface ExecutorDataPlayerState extends PlayerState {
  id: number;
  lobby_id: string;
  round: number;
}

interface ExecutorDataBlockHeight {
  block_height: number;
  seed: string;
  done: boolean;
}

interface ExecutorDataSeed {
  block_height: number;
  seed: string;
  round: number;
}

export interface RoundExecutorData {
  block_height: ExecutorDataBlockHeight;
  lobby: any;
  moves: TurnAction[];
  round_data: any;
}

export interface MatchExecutorData {
  lobby: any;
  states: ExecutorDataPlayerState[];
  seeds: ExecutorDataSeed[];
  moves: TurnAction[];
  initialState: MatchState;
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

export interface StatefulNftId {
  nft_contract: string;
  token_id: number;
}

export interface IndexerNftOwnership {
  tokenId: number;
  contract: string;
  owner: string;
}

export interface MatchWinnerResponse {
  match_status: LobbyStatus;
  winner_address: string;
}
export interface MapByNameResponse {
  map_layout: string;
}
export interface LobbyDbQuery {
  created_at: Date;
  creation_block_height: number;
  current_round: number;
  grid_size: number;
  health: number;
  hidden: boolean;
  lobby_creator: string;
  lobby_creator_animal: string | null;
  lobby_id: string;
  lobby_state: LobbyStatus;
  map: string;
  num_of_rounds: number;
  round_length: number;
}
export interface UserNft {
  wallet: WalletAddress;
  nftContract: ContractAddress | null;
  tokenId: number | null;
}

export interface LobbyWebserverQuery {
  lobby: LobbyDbQuery;
  nft: UserNft;
}

export interface RichOpenLobbyState extends LobbyDbQuery {
  wins: number;
  losses: number;
}
