import pkg from 'web3-utils';
const { numberToHex, utf8ToHex } = pkg;

import { GameENV, Structure, TurnAction } from '@tower-defense/utils';
import { LobbyWebserverQuery, UserNft } from '../types';
import { getTxTemplate } from 'paima-engine/paima-tx';
import { buildEndpointErrorFxn, CatapultMiddlewareErrorCode } from '../errors';
import { getDeployment, getFee, getStorageAddress } from '../state';
import type {
  BatchedSubunit,
  IndexerNftOwnership,
  LobbyState,
  NFT,
  NftScore,
  NftScoreSnake,
  PackedLobbyState,
  RoundEnd,
  SignFunction,
} from '../types';
import { getBlockTime } from './general';
import { pushLog } from './logging';

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

export function moveToString(move: TurnAction): string {
  switch (move.action) {
    case 'build':
      return `b${move.coordinates},${conciseStructure(move.structure)}`;
    case 'repair':
      return `r${move.id}`;
    case 'upgrade':
      return `u${move.id}`;
    case 'salvage':
      return `s${move.id}`;
    default:
      pushLog('[moveToString] found move with invalid type:', move);
      throw new Error(`Invalid move submitted: ${move}`);
  }
}
function conciseStructure(s: Structure): string {
  if (s === 'anacondaTower') return 'at';
  else if (s === 'piranhaTower') return 'pt';
  else if (s === 'slothTower') return 'st';
  else if (s === 'gorillaCrypt') return 'gc';
  else if (s === 'jaguarCrypt') return 'jc';
  else if (s === 'macawCrypt') return 'mc';
  else return 'mc'; // error message?
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

export function lobbyWasClosed(lobby: PackedLobbyState): boolean {
  const { lobby: lobbyState } = lobby;
  if (!lobbyState) {
    return false;
  }

  return lobbyState.lobby_state === 'closed';
}

export function buildDirectTx(
  userAddress: string,
  methodName: 'paimaSubmitGameInput',
  dataUtf8: string
): Record<string, any> {
  const hexData = utf8ToHex(dataUtf8);
  const txTemplate = getTxTemplate(getStorageAddress(), methodName, hexData);
  const tx = {
    ...txTemplate,
    from: userAddress,
    value: numberToHex(getFee()),
  };

  return tx;
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
    errorFxn(CatapultMiddlewareErrorCode.INTERNAL_INVALID_DEPLOYMENT, err);
    return {
      blocks: 0,
      seconds: 0,
    };
  }
}

export function nftScoreSnakeToCamel(nftScore: NftScoreSnake): NftScore {
  return {
    nftContract: nftScore.nft_contract,
    tokenId: nftScore.token_id,
    totalGames: nftScore.total_games,
    wins: nftScore.wins,
    draws: nftScore.draws,
    losses: nftScore.losses,
    score: nftScore.score,
  };
}

export function userNftIndexerToMiddleware(nft: IndexerNftOwnership): UserNft {
  return {
    wallet: nft.owner,
    nftContract: nft.contract,
    tokenId: nft.tokenId,
  };
}

export function lobbiesToTokenIdSet(lobbies: LobbyWebserverQuery[]): number[] {
  const s = new Set<number>([]);
  // NOTE: All NFTs are expected to be of the same contract
  for (const lobby of lobbies) {
    if (lobby.nft.nftContract === GameENV.NFT_CONTRACT && lobby.nft.tokenId) {
      s.add(lobby.nft.tokenId);
    }
  }
  return Array.from(s);
}
