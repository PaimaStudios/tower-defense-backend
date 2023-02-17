import { Structure, TurnAction } from '@tower-defense/utils';
import { buildEndpointErrorFxn, CatapultMiddlewareErrorCode } from '../errors';
import { getDeployment } from '../state';
import type {
  BatchedSubunit,
  LobbyState,
  MatchMove,
  NFT,
  PackedLobbyState,
  RoundEnd,
  SignFunction,
} from '../types';
import { getBlockTime } from './general';

export function batchedToJsonString(b: BatchedSubunit): string {
  return JSON.stringify({
    user_address: b.userAddress,
    user_signature: b.userSignature,
    game_input: b.gameInput,
    timestamp: b.millisecondTimestamp,
  });
}

export function batchedToString(b: BatchedSubunit): string {
  return [b.userAddress, b.userSignature, b.gameInput, b.millisecondTimestamp].join('/');
}

export function moveToString(action: TurnAction): string {
  switch (action.action) {
    case 'build':
      return `b,${action.coordinates.toString(10)}--${structureToConcise(action.structure)}`;
    case 'repair':
      return `r,${action.id.toString(10)}`;
    case 'upgrade':
      return `u,${action.id.toString(10)}`
    case 'salvage':
      return `s,${action.id.toString(10)}`
    default:
      console.log('[moveToString] found move with invalid type:', action);
      throw new Error(`Invalid move submitted: ${action}`);
  }
}
export function structureToConcise(s: Structure): string{
  switch(s){
    case 'anacondaTower': return "at";
    case 'piranhaTower': return "pt";
    case 'slothTower': return "st";
    case 'gorillaCrypt': return "gc";
    case 'jaguarCrypt': return "jc";
    case 'macawCrypt': return "mc";
  }
}

export function nftToStrings(nft: NFT): string[] {
  return [nft.title, nft.imageUrl, nft.nftAddress, `${nft.tokenId}`];
}

export function userJoinedLobby(address: String, lobby: PackedLobbyState): boolean {
  if (!lobby.hasOwnProperty('lobby')) {
    return false;
  }
  const l: LobbyState = lobby.lobby;

  if (!l.hasOwnProperty('player_two')) {
    return false;
  }
  if (!l.player_two || !address) {
    return false;
  }
  return l.player_two.toLowerCase() === address.toLowerCase();
}

export function userCreatedLobby(address: String, lobby: PackedLobbyState): boolean {
  if (!lobby.hasOwnProperty('lobby')) {
    return false;
  }
  const l: LobbyState = lobby.lobby;

  if (!l.hasOwnProperty('lobby_creator')) {
    return false;
  }
  if (!l.lobby_creator || !address) {
    return false;
  }
  return l.lobby_creator.toLowerCase() === address.toLowerCase();
}

export async function buildBatchedSubunit(
  signFunction: SignFunction,
  userAddress: string,
  gameInput: string
): Promise<BatchedSubunit> {
  const millisecondTimestamp: string = new Date().getTime().toString(10);
  const message: string = gameInput + millisecondTimestamp;
  const userSignature = await signFunction(userAddress, message);
  return {
    userAddress,
    userSignature,
    gameInput,
    millisecondTimestamp,
  };
}

export function calculateRoundEnd(
  roundStart: number,
  roundLength: number,
  current: number
): RoundEnd {
  const errorFxn = buildEndpointErrorFxn('calculateRoundEnd');

  let roundEnd = roundStart + roundLength;
  if (roundEnd < current) {
    errorFxn(CatapultMiddlewareErrorCode.CALCULATED_ROUND_END_IN_PAST);
    roundEnd = current;
  }

  try {
    const blocksToEnd = roundEnd - current;
    const secsPerBlock = getBlockTime(getDeployment());
    const secondsToEnd = blocksToEnd * secsPerBlock;
    return {
      blocks: blocksToEnd,
      seconds: secondsToEnd,
    };
  } catch (err) {
    const { message } = errorFxn(CatapultMiddlewareErrorCode.INTERNAL_INVALID_DEPLOYMENT, err);
    throw new Error(message);
  }
}
