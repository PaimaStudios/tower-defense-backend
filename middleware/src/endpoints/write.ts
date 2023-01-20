import { retryPromise } from 'paima-engine/paima-utils';
import { buildEndpointErrorFxn, CatapultMiddlewareErrorCode } from '../errors';
import {
  awaitBlock,
  getLobbyStateWithUser,
  getNonemptyNewLobbies,
} from '../helpers/auxiliary-queries';
import { postConciselyEncodedData } from '../helpers/contract-interaction';
import { moveToString, userCreatedLobby, userJoinedLobby } from '../helpers/data-processing';
import { getActiveAddress } from '../state';
import { CreateLobbyResponse, MatchMove, OldResult } from '../types';

const RETRY_PERIOD = 3000;
const RETRIES_COUNT = 3;

async function createLobby(
  numberOfLives: number,
  numberOfRounds: number,
  roundLength: number,
  map: string,
  gridSize: number,
  selectedAnimal: string
): Promise<CreateLobbyResponse> {
  const errorFxn = buildEndpointErrorFxn('createLobby');

  let wallet: string;
  try {
    wallet = getActiveAddress();
  } catch (err) {
    return errorFxn(CatapultMiddlewareErrorCode.INTERNAL_INVALID_POSTING_MODE, err);
  }

  if (wallet.length === 0) {
    return errorFxn(CatapultMiddlewareErrorCode.WALLET_NOT_CONNECTED);
  }
  const userWalletAddress = wallet;

  const allowedWallets: string[] = [];

  const dataStrings = [
    'c',
    numberOfLives.toString(10),
    gridSize.toString(10),
    numberOfRounds.toString(10),
    roundLength.toString(10),
    allowedWallets.join(','),
    map,
    selectedAnimal,
  ];

  let currentBlockVar: number;
  try {
    const result = await postConciselyEncodedData(userWalletAddress, 'createLobby', dataStrings);
    if (!result.success) {
      return errorFxn(CatapultMiddlewareErrorCode.ERROR_POSTING_TO_CHAIN, result.message);
    }
    currentBlockVar = result.result;

    if (currentBlockVar < 0) {
      return errorFxn(
        CatapultMiddlewareErrorCode.ERROR_POSTING_TO_CHAIN,
        `Received block height: ${currentBlockVar}`
      );
    }
  } catch (err) {
    return errorFxn(CatapultMiddlewareErrorCode.ERROR_POSTING_TO_CHAIN, err);
  }
  const currentBlock = currentBlockVar;

  try {
    await awaitBlock(currentBlock);
    const newLobbies = await retryPromise(
      () => getNonemptyNewLobbies(userWalletAddress, currentBlock),
      RETRY_PERIOD,
      RETRIES_COUNT
    );
    if (
      !newLobbies.hasOwnProperty('lobbies') ||
      !Array.isArray(newLobbies.lobbies) ||
      newLobbies.lobbies.length === 0
    ) {
      return errorFxn(CatapultMiddlewareErrorCode.FAILURE_VERIFYING_LOBBY_CREATION);
    } else {
      return {
        success: true,
        lobbyID: newLobbies.lobbies[0].lobby_id,
        lobbyStatus: 'open',
      };
    }
  } catch (err) {
    return errorFxn(CatapultMiddlewareErrorCode.FAILURE_VERIFYING_LOBBY_CREATION, err);
  }
}

async function joinLobby(lobbyID: string, selectedAnimal: string): Promise<OldResult> {
  const errorFxn = buildEndpointErrorFxn('joinLobby');

  let wallet: string;
  try {
    wallet = getActiveAddress();
  } catch (err) {
    return errorFxn(CatapultMiddlewareErrorCode.INTERNAL_INVALID_POSTING_MODE, err);
  }

  if (wallet.length === 0) {
    return errorFxn(CatapultMiddlewareErrorCode.WALLET_NOT_CONNECTED);
  }
  const userWalletAddress = wallet;

  const dataStrings = ['j', '*' + lobbyID, selectedAnimal];

  let currentBlockVar: number;
  try {
    const result = await postConciselyEncodedData(userWalletAddress, 'joinLobby', dataStrings);
    if (!result.success) {
      return errorFxn(CatapultMiddlewareErrorCode.ERROR_POSTING_TO_CHAIN, result.message);
    }
    currentBlockVar = result.result;

    if (currentBlockVar < 0) {
      return errorFxn(
        CatapultMiddlewareErrorCode.ERROR_POSTING_TO_CHAIN,
        `Received block height: ${currentBlockVar}`
      );
    }
  } catch (err) {
    return errorFxn(CatapultMiddlewareErrorCode.ERROR_POSTING_TO_CHAIN, err);
  }
  const currentBlock = currentBlockVar;

  try {
    await awaitBlock(currentBlock);
    const lobbyState = await retryPromise(
      () => getLobbyStateWithUser(lobbyID, userWalletAddress),
      RETRY_PERIOD,
      RETRIES_COUNT
    );
    if (userJoinedLobby(userWalletAddress, lobbyState)) {
      return {
        success: true,
        message: '',
      };
    } else if (userCreatedLobby(userWalletAddress, lobbyState)) {
      return errorFxn(CatapultMiddlewareErrorCode.CANNOT_JOIN_OWN_LOBBY);
    } else {
      return errorFxn(CatapultMiddlewareErrorCode.FAILURE_VERIFYING_LOBBY_JOIN);
    }
  } catch (err) {
    return errorFxn(CatapultMiddlewareErrorCode.FAILURE_VERIFYING_LOBBY_JOIN);
  }
}

async function submitMoves(
  lobbyID: string,
  roundNumber: number,
  moves: MatchMove[]
): Promise<OldResult> {
  const errorFxn = buildEndpointErrorFxn('submitMoves');

  let wallet: string;
  try {
    wallet = getActiveAddress();
  } catch (err) {
    return errorFxn(CatapultMiddlewareErrorCode.INTERNAL_INVALID_POSTING_MODE, err);
  }

  if (wallet.length === 0) {
    return errorFxn(CatapultMiddlewareErrorCode.WALLET_NOT_CONNECTED);
  }
  const userWalletAddress = wallet;

  if (moves.length !== 3) {
    return errorFxn(
      CatapultMiddlewareErrorCode.SUBMIT_MOVES_EXACTLY_3,
      `Submitted moves count: ${moves.length}`
    );
  }

  const dataStrings = ['s', '*' + lobbyID, roundNumber.toString(10)];
  try {
    moves.forEach(move => {
      dataStrings.push(moveToString(move));
    });
  } catch (err) {
    return errorFxn(CatapultMiddlewareErrorCode.SUBMIT_MOVES_INVALID_MOVES, err);
  }

  return postConciselyEncodedData(userWalletAddress, 'submitMoves', dataStrings)
    .then(() => ({ success: true, message: '' }))
    .catch((err: string) => ({ success: false, message: err }));
}

async function setNft(nftAddress: string, nftId: number): Promise<OldResult> {
  const errorFxn = buildEndpointErrorFxn('setNft');

  let wallet: string;
  try {
    wallet = getActiveAddress();
  } catch (err) {
    return errorFxn(CatapultMiddlewareErrorCode.INTERNAL_INVALID_POSTING_MODE, err);
  }

  if (wallet.length === 0) {
    return errorFxn(CatapultMiddlewareErrorCode.WALLET_NOT_CONNECTED);
  }
  const userWalletAddress = wallet;
  const dataStrings = ['n', nftAddress, nftId.toString(10)];

  return postConciselyEncodedData(userWalletAddress, 'setNft', dataStrings)
    .then(() => ({
      success: true,
      message: '',
    }))
    .catch(err => {
      return errorFxn(CatapultMiddlewareErrorCode.ERROR_POSTING_TO_CHAIN, err);
    });
}

export const writeEndpoints = {
  createLobby,
  joinLobby,
  submitMoves,
  setNft,
};
