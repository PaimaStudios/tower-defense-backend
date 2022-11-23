import { MatchState, TurnAction } from "@tower-defense/utils";

export type Hash = string;
export type URI = string;
export type ISO8601Date = string;
export type CardanoAddress = Hash;
export type EthAddress = Hash;
export type Address = CardanoAddress | EthAddress;
export type UserAddress = Address;
export type ContractAddress = EthAddress;
export type UserSignature = Hash;
export type GameInput = string;

// import type {
//   ContractAddress,
//   GameInput,
//   Hash,
//   URI,
//   UserAddress,
//   UserSignature,
// } from "catapult-utils";

export interface BatchedSubunit {
  userAddress: UserAddress;
  userSignature: UserSignature;
  gameInput: GameInput;
  millisecondTimestamp: string;
}

export interface MiddlewareConnectionDetails {
  storageAddress: ContractAddress;
  backendUri: URI;
  indexerUri: URI;
  batcherUri: URI;
}

export interface MiddlewareConfig extends MiddlewareConnectionDetails {
  localVersion: string;
}

export interface PostingInfo {
  address: UserAddress;
  postingModeString: PostingModeString;
}

export type PostingModeString = "unbatched" | "batched-eth" | "batched-cardano";

export type PostingModeSwitchResult =
  | PostingModeSwitchSuccessfulResult
  | FailedResult;

interface PostingModeSwitchSuccessfulResult extends PostingInfo {
  success: true;
}

export type SignFunction = (
  userAddress: UserAddress,
  message: string
) => Promise<string>;

export type CardanoApi = any;

export type Deployment = "C1" | "A1";

export interface SuccessfulResultMessage {
  success: true;
  message: string;
}

export interface SuccessfulResult<T> {
  success: true;
  result: T;
}

export interface FailedResult {
  success: false;
  message: string;
}

export interface RoundEnd {
  blocks: number;
  seconds: number;
}

export type QueryValue = string | number | boolean;
export type QueryOptions = { [key: string]: QueryValue };

export type Result<T> = SuccessfulResult<T> | FailedResult;
export type OldResult = SuccessfulResultMessage | FailedResult;

export type MapName = "jungle" | "ocean";

export type UserAnimal =
  | "piranha"
  | "gorilla"
  | "anaconda"
  | "jaguar"
  | "macaw"
  | "sloth";

export interface Wallet {
  success: true;
  walletAddress: UserAddress;
}

type LobbyStatus = "active" | "open" | "finished" | "unknown";

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

export interface NFT {
  title: string;
  imageUrl: URI;
  nftAddress: ContractAddress;
  tokenId: number;
}

export interface DisplayNFT {
  title: string;
  image: URI;
}

export interface User {
  wallet: UserAddress;
  avatarNFT: NFT;
  tauntNFT: NFT;
}

export interface BasicLobbyInfo {
  lobby_id: Hash;
  health: number;
  spawnLimit: number;
  current_round: number;
  num_of_rounds: number;
  map: MapName;
  created_at: Date;
  creation_block_height: number;
  round_length: number;
  round_ends_in_blocks: number;
  round_ends_in_secs: number;
  round_start_height: number;
  lobby_creator: UserAddress;
  creator_faction: Faction
  initial_gold: number;
}

export type Faction = "attacker" | "defender";

export interface OpenLobbyState extends BasicLobbyInfo {
  lobby_state: "open";
  player_two: null;
  player_two_faction:  null;
}

export interface ActiveLobbyState extends BasicLobbyInfo {
  lobby_state: "active";
  player_turn: UserAddress;
  player_two: UserAddress;
  player_two_faction: Faction;
}

export interface FinishedLobbyState extends BasicLobbyInfo {
  lobby_state: "finished";
  player_two: UserAddress;
  player_two_faction: Faction;
}

export type LobbyState = OpenLobbyState | ActiveLobbyState | FinishedLobbyState;

export interface PackedLobbyState {
  success: true;
  lobby: LobbyState;
}

export interface RoundExecutionState {
  executed: boolean;
  usersWhoSubmittedMoves: UserAddress[];
  roundEndsInBlocks: number;
  roundEndsInSeconds: number;
}

export interface PackedRoundExecutionState {
  success: true;
  round: RoundExecutionState;
}

export interface LobbyStates {
  success: true;
  lobbies: LobbyState[];
}

export interface UserState {
  userAddress: UserAddress; // or wallet?
  userPosition: number;
  userHealth: number;
  userAnimal: UserAnimal;
  wallet: UserAddress;
  avatarNFT: NFT;
  tauntNFT: NFT;
}
export type MatchMove = Reposition | Fire | Taunt;

export interface Reposition {
  moveType: "reposition";
  position: number;
}

export interface Fire {
  moveType: "fire";
  position: number;
}

export interface Taunt {
  moveType: "taunt";
}

export interface UserStats {
  wallet: UserAddress;
  wins: number;
  losses: number;
}

export interface PackedUserStats {
  success: true;
  stats: UserStats;
}

interface AccountNftsResult {
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

export interface RoundStatusData {
  round: {
      roundStarted: number;
      roundLength: number;
      executed: boolean;
      usersWhoSubmittedMoves: UserAddress[];
  };
}

interface BatcherPostResponseSuccessful {
  success: true;
  hash: Hash;
}

interface BatcherPostResponseUnsuccessful {
  success: false;
  message: string;
}

export type BatcherPostResponse =
  | BatcherPostResponseSuccessful
  | BatcherPostResponseUnsuccessful;

type BatcherTrackingStatus = string;

interface BatcherTrackResponseUnsuccessful {
  success: false;
  message: string;
}

interface BatcherTrackResponseCore {
  success: true;
  hash: Hash;
}

interface BatcherTrackResponsePosted extends BatcherTrackResponseCore {
  status: "posted";
  block_height: number;
  transaction_hash: Hash;
}

interface BatcherTrackResponseRejected extends BatcherTrackResponseCore {
  status: "rejected";
  message: string;
}

interface BatcherTrackResponseOther extends BatcherTrackResponseCore {
  status: "accepted" | "validating";
}

export type BatcherTrackResponse =
  | BatcherTrackResponsePosted
  | BatcherTrackResponseRejected
  | BatcherTrackResponseOther;

export type RoundExecutor = any;
export type MatchExecutor = any;

export interface PlayerStatePair {
  user1: PlayerState;
  user2: PlayerState;
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

interface ExecutorDataRoundData {
  id: number;
  lobby_id: string;
  round_within_match: number;
  starting_block_height: number;
  execution_block_height: number;
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

export interface ExecutorMove {
  id: number;
  lobby_id: string;
  move_type: string;
  position: number | null;
  round: number;
  wallet: string;
}

export interface RoundExecutorData {
  block_height: ExecutorDataBlockHeight;
  config: ActiveLobbyState | FinishedLobbyState;
  state: MatchState;
  moves: TurnAction[];
}

export interface MatchExecutorData {
  config: ActiveLobbyState | FinishedLobbyState;
  states: MatchState[];
  seeds: ExecutorDataSeed[];
  moves: TurnAction[];
}

/*
export interface Opponent{
  opponentAddress: Hash,
  NFT: NFT
}

export interface MockData {
wallet: Wallet;
lobbies: OpenLobby[];
inLobbies: Lobby[];
lobby: LobbyState;
stats: UserStats;
opponents: [Opponent, Opponent, Opponent];
}
*/
