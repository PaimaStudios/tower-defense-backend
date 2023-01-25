export interface CreatedLobbyInput {
  input: 'createdLobby';
  health: number;
  gridSize: number;
  numOfRounds: number;
  roundLength: number;
  map: Map;
  selectedAnimal: Animal;
  isHidden: boolean;
  isPractice: boolean;
}

export interface JoinedLobbyInput {
  input: 'joinedLobby';
  lobbyID: string;
  selectedAnimal: Animal;
}

export interface SetNFTInput {
  input: 'setNFT';
  address: string;
  tokenID: number;
}

export type WalletAddress = string;
export type Map = string;
type Animal = string;
