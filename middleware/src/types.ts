import type {
  ContractAddress,
  GameInput,
  Hash,
  LobbyStatus,
  MatchConfig,
  MatchState,
  TurnAction,
  URI,
  UserAddress,
  UserSignature,
} from '@tower-defense/utils';

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
  statefulUri: URI;
  batcherUri: URI;
}

export interface MiddlewareConfig extends MiddlewareConnectionDetails {
  localVersion: string;
}

export interface PostingInfo {
  address: UserAddress;
  postingModeString: PostingModeString;
}

export type PostingModeString = 'unbatched' | 'batched-eth' | 'batched-cardano' | 'automatic';

export type PostingModeSwitchResult = PostingModeSwitchSuccessfulResult | FailedResult;

interface PostingModeSwitchSuccessfulResult extends PostingInfo {
  success: true;
}

export type SignFunction = (userAddress: UserAddress, message: string) => Promise<string>;

export type CardanoApi = any;

export type Deployment = 'C1' | 'A1';

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
  errorMessage: string;
  errorCode: number;
}

export interface RoundEnd {
  blocks: number;
  seconds: number;
}

export type QueryValue = string | number | boolean;
export type QueryOptions = Record<string, QueryValue>;

export type Result<T> = SuccessfulResult<T> | FailedResult;
export type OldResult = SuccessfulResultMessage | FailedResult;

export type MapName = 'jungle' | 'ocean';

export type UserAnimal = 'piranha' | 'gorilla' | 'anaconda' | 'jaguar' | 'macaw' | 'sloth';

export interface Wallet {
  walletAddress: UserAddress;
}

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
  grid_size: number;
  num_of_rounds: number;
  current_round: number;
  round_length: number;
  round_start_height: number;
  map: MapName;
  created_at: string;
  creation_block_height: number;
  lobby_creator: UserAddress;
  lobby_creator_animal: UserAnimal;
  player_two: UserAddress;
  player_two_animal: UserAnimal;
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

export interface RichOpenLobbyStates {
  success: true;
  lobbies: RichOpenLobbyState[];
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
  moveType: 'reposition';
  position: number;
}

export interface Fire {
  moveType: 'fire';
  position: number;
}

export interface Taunt {
  moveType: 'taunt';
}

export interface UserStats {
  wallet: UserAddress;
  wins: number;
  losses: number;
  ties: number;
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

export type BatcherPostResponse = BatcherPostResponseSuccessful | BatcherPostResponseUnsuccessful;

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
  status: 'posted';
  block_height: number;
  transaction_hash: Hash;
}

interface BatcherTrackResponseRejected extends BatcherTrackResponseCore {
  status: 'rejected';
  message: string;
}

interface BatcherTrackResponseOther extends BatcherTrackResponseCore {
  status: 'accepted' | 'validating';
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

export interface ExecutorDataSeed {
  block_height: number;
  seed: string;
  round: number;
}

export interface RoundExecutorData {
  block_height: ExecutorDataBlockHeight;
  config: string; // config concise encoding
  state: MatchState;
  moves: TurnAction[];
}

export interface MatchExecutorData {
  lobby: LobbyState;
  states: ExecutorDataPlayerState[];
  seeds: ExecutorDataSeed[];
  moves: TurnAction[];
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

export interface MatchWinnerResponse {
  match_status: LobbyStatus;
  winner_address: string;
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
  wallet: UserAddress;
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