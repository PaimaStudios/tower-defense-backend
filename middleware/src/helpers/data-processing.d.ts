import type { BatchedSubunit, MatchMove, NFT, PackedLobbyState, RoundEnd, SignFunction } from "../types";
export declare function batchedToJsonString(b: BatchedSubunit): string;
export declare function batchedToString(b: BatchedSubunit): string;
export declare function moveToString(move: MatchMove): string;
export declare function nftToStrings(nft: NFT): string[];
export declare function userJoinedLobby(address: String, lobby: PackedLobbyState): boolean;
export declare function userCreatedLobby(address: String, lobby: PackedLobbyState): boolean;
export declare function buildBatchedSubunit(signFunction: SignFunction, userAddress: string, gameInput: string): Promise<BatchedSubunit>;
export declare function calculateRoundEnd(roundStart: number, roundLength: number, current: number): RoundEnd;
