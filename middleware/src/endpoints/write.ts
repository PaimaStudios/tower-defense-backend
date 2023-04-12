import { retryPromise } from 'paima-engine/paima-utils';
import { builder } from 'paima-engine/paima-concise';

import type { EndpointErrorFxn } from '../errors';
import { buildEndpointErrorFxn, MiddlewareErrorCode } from '../errors';
import { getLobbyStateWithUser, getNonemptyNewLobbies, getUserConfigs } from '../helpers/auxiliary-queries';
import {
  lobbyWasClosed,
  moveToString,
  userCreatedLobby,
  userJoinedLobby,
} from '../helpers/utility-functions';
import type { CreateLobbyResponse, OldResult, Result } from '../types';
import { configToConcise, Faction, MapName, TurnAction } from '@tower-defense/utils';
import {
  awaitBlock,
  getActiveAddress,
  PaimaMiddlewareErrorCode,
  postConciselyEncodedData,
} from 'paima-engine/paima-mw-core';
import { MatchConfig } from '@tower-defense/utils';

const RETRY_PERIOD = 1000;
const RETRIES_COUNT = 8;

const getUserWallet = (errorFxn: EndpointErrorFxn): Result<string> => {
  try {
    const wallet = getActiveAddress();
    if (wallet.length === 0) {
      return errorFxn(PaimaMiddlewareErrorCode.WALLET_NOT_CONNECTED);
    }
    return { result: wallet, success: true };
  } catch (err) {
    return errorFxn(MiddlewareErrorCode.INTERNAL_INVALID_POSTING_MODE, err);
  }
};

interface CreateLobbyParams {
  presetName: 'short' | 'medium' | 'long';
  role: Faction | 'random';
  numberOfRounds: number;
  roundLength: number;
  isHidden: boolean;
  mapName: MapName;
  isPractice: boolean;
}

async function createLobby(json: string): Promise<CreateLobbyResponse> {
  const errorFxn = buildEndpointErrorFxn('createLobby');

  const query = getUserWallet(errorFxn);
  if (!query.success) return query;
  const userWalletAddress = query.result;
  console.log(JSON.parse(json), 'json parsed');
  const parsed: CreateLobbyParams = JSON.parse(json);
  const { presetName, role, numberOfRounds, roundLength, isHidden, mapName, isPractice } = parsed;
  const configName =
    presetName === 'short'
      ? 'defaultdefault'
      : presetName === 'medium'
      ? 'defaultdefault'
      : presetName === 'long'
      ? 'defaultdefault'
      : 'defaultdefault';
  const roleEncoding =
    role === 'attacker' ? 'a' : role === 'defender' ? 'd' : role === 'random' ? 'r' : 'r';

  const conciseBuilder = builder.initialize();
  conciseBuilder.setPrefix('c');
  conciseBuilder.addValues([
    { value: configName },
    { value: roleEncoding },
    { value: numberOfRounds.toString(10) },
    { value: roundLength.toString(10) },
    { value: isHidden ? 'T' : 'F' },
    { value: mapName },
    { value: isPractice ? 'T' : 'F' },
  ]);

  let currentBlockVar: number;
  try {
    const result = await postConciselyEncodedData(conciseBuilder.build());
    if (!result.success) {
      return errorFxn(PaimaMiddlewareErrorCode.ERROR_POSTING_TO_CHAIN, result.errorMessage);
    }
    currentBlockVar = result.result;

    if (currentBlockVar < 0) {
      return errorFxn(
        PaimaMiddlewareErrorCode.ERROR_POSTING_TO_CHAIN,
        `Received block height: ${currentBlockVar}`
      );
    }
  } catch (err) {
    return errorFxn(PaimaMiddlewareErrorCode.ERROR_POSTING_TO_CHAIN, err);
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
      return errorFxn(MiddlewareErrorCode.FAILURE_VERIFYING_LOBBY_CREATION);
    } else {
      return {
        success: true,
        lobbyID: newLobbies.lobbies[0].lobby_id,
        lobbyStatus: 'open',
      };
    }
  } catch (err) {
    return errorFxn(MiddlewareErrorCode.FAILURE_VERIFYING_LOBBY_CREATION, err);
  }
}

async function joinLobby(lobbyID: string): Promise<OldResult> {
  const errorFxn = buildEndpointErrorFxn('joinLobby');

  const query = getUserWallet(errorFxn);
  if (!query.success) return query;
  const userWalletAddress = query.result;

  const conciseBuilder = builder.initialize();
  conciseBuilder.setPrefix('j');
  conciseBuilder.addValue({ value: lobbyID, isStateIdentifier: true });

  let currentBlockVar: number;
  try {
    const result = await postConciselyEncodedData(conciseBuilder.build());
    if (!result.success) {
      return errorFxn(PaimaMiddlewareErrorCode.ERROR_POSTING_TO_CHAIN, result.errorMessage);
    }
    currentBlockVar = result.result;

    if (currentBlockVar < 0) {
      return errorFxn(
        PaimaMiddlewareErrorCode.ERROR_POSTING_TO_CHAIN,
        `Received block height: ${currentBlockVar}`
      );
    }
  } catch (err) {
    return errorFxn(PaimaMiddlewareErrorCode.ERROR_POSTING_TO_CHAIN, err);
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
      return errorFxn(MiddlewareErrorCode.CANNOT_JOIN_OWN_LOBBY);
    } else {
      return errorFxn(MiddlewareErrorCode.FAILURE_VERIFYING_LOBBY_JOIN);
    }
  } catch (err) {
    return errorFxn(MiddlewareErrorCode.FAILURE_VERIFYING_LOBBY_JOIN);
  }
}

async function closeLobby(lobbyID: string): Promise<OldResult> {
  const errorFxn = buildEndpointErrorFxn('closeLobby');

  const query = getUserWallet(errorFxn);
  if (!query.success) return query;
  const userWalletAddress = query.result;

  const conciseBuilder = builder.initialize();
  conciseBuilder.setPrefix('cs');
  conciseBuilder.addValue({ value: lobbyID, isStateIdentifier: true });

  let currentBlockVar: number;
  try {
    const result = await postConciselyEncodedData(conciseBuilder.build());
    if (!result.success) {
      return errorFxn(PaimaMiddlewareErrorCode.ERROR_POSTING_TO_CHAIN, result.errorMessage);
    }
    currentBlockVar = result.result;

    if (currentBlockVar < 0) {
      return errorFxn(
        PaimaMiddlewareErrorCode.ERROR_POSTING_TO_CHAIN,
        `Received block height: ${currentBlockVar}`
      );
    }
  } catch (err) {
    return errorFxn(PaimaMiddlewareErrorCode.ERROR_POSTING_TO_CHAIN, err);
  }
  const currentBlock = currentBlockVar;

  try {
    await awaitBlock(currentBlock);
    const lobbyState = await retryPromise(
      () => getLobbyStateWithUser(lobbyID, userWalletAddress),
      RETRY_PERIOD,
      RETRIES_COUNT
    );
    if (lobbyWasClosed(lobbyState)) {
      return { success: true, message: '' };
    } else if (!userCreatedLobby(userWalletAddress, lobbyState)) {
      return errorFxn(MiddlewareErrorCode.CANNOT_CLOSE_SOMEONES_LOBBY);
    } else {
      return errorFxn(MiddlewareErrorCode.FAILURE_VERIFYING_LOBBY_CLOSE);
    }
  } catch (err) {
    return errorFxn(MiddlewareErrorCode.FAILURE_VERIFYING_LOBBY_CLOSE);
  }
}
interface SubmitMovesParams {
  lobbyID: string;
  roundNumber: number;
  moves: TurnAction[];
}
async function submitMoves(json: string): Promise<OldResult> {
  const errorFxn = buildEndpointErrorFxn('submitMoves');

  const query = getUserWallet(errorFxn);
  if (!query.success) return query;

  const parsed: SubmitMovesParams = JSON.parse(json);
  const { lobbyID, roundNumber, moves } = parsed;
  console.log(moves, 'moves sent');
  console.log(moves.map(m => ({ value: moveToString(m) })));

  const conciseBuilder = builder.initialize();
  conciseBuilder.setPrefix('s');
  conciseBuilder.addValue({ value: lobbyID, isStateIdentifier: true });
  conciseBuilder.addValue({ value: roundNumber.toString(10) });

  try {
    conciseBuilder.addValues(moves.map(m => ({ value: moveToString(m) })));
  } catch (err) {
    return errorFxn(MiddlewareErrorCode.SUBMIT_MOVES_INVALID_MOVES, err);
  }
  try {
    const result = await postConciselyEncodedData(conciseBuilder.build());
    if (result.success) {
      return { success: true, message: '' };
    } else {
      return errorFxn(PaimaMiddlewareErrorCode.ERROR_POSTING_TO_CHAIN);
    }
  } catch (err) {
    return errorFxn(PaimaMiddlewareErrorCode.ERROR_POSTING_TO_CHAIN, err);
  }
}

async function setNft(nftAddress: string, nftId: number): Promise<OldResult> {
  const errorFxn = buildEndpointErrorFxn('setNft');

  const query = getUserWallet(errorFxn);
  if (!query.success) return query;

  const conciseBuilder = builder.initialize();
  conciseBuilder.setPrefix('n');
  conciseBuilder.addValue({ value: nftAddress });
  conciseBuilder.addValue({ value: nftId.toString(10) });

  try {
    const result = await postConciselyEncodedData(conciseBuilder.build());
    if (result.success) {
      return { success: true, message: '' };
    } else {
      return errorFxn(PaimaMiddlewareErrorCode.ERROR_POSTING_TO_CHAIN);
    }
  } catch (err) {
    return errorFxn(PaimaMiddlewareErrorCode.ERROR_POSTING_TO_CHAIN, err);
  }
}

async function registerConfig(config: MatchConfig): Promise<any> {
  const errorFxn = buildEndpointErrorFxn('joinLobby');

  const query = getUserWallet(errorFxn);
  if (!query.success) return query;
  const userWalletAddress = query.result;

  const conciseBuilder = builder.initialize();
  conciseBuilder.setPrefix('r');
  conciseBuilder.addValue({ value: "1", isStateIdentifier: false });
  const configString = configToConcise(config);
  conciseBuilder.addValue({ value: configString, isStateIdentifier: false });
  const finalString = conciseBuilder.build();
  console.log(finalString, "final string")

  let currentBlockVar: number;
  try {
    const result = await postConciselyEncodedData(finalString);
    if (!result.success) {
      return errorFxn(PaimaMiddlewareErrorCode.ERROR_POSTING_TO_CHAIN, result.errorMessage);
    }
    currentBlockVar = result.result;

    if (currentBlockVar < 0) {
      return errorFxn(
        PaimaMiddlewareErrorCode.ERROR_POSTING_TO_CHAIN,
        `Received block height: ${currentBlockVar}`
      );
    }
  } catch (err) {
    return errorFxn(PaimaMiddlewareErrorCode.ERROR_POSTING_TO_CHAIN, err);
  }
  const currentBlock = currentBlockVar;

  try {
    await awaitBlock(currentBlock);
    const userConfigs = await retryPromise(
      () => getUserConfigs(userWalletAddress),
      RETRY_PERIOD,
      RETRIES_COUNT
    );
    const registeredConfig = userConfigs.configs.find(c => c.content === finalString);
    if (registeredConfig) {
      return {
        success: true,
        message: `config registered as ${registeredConfig?.id}`,
      };
    } else {
      return errorFxn(MiddlewareErrorCode.FAILURE_VERIFYING_LOBBY_JOIN);
    }
  } catch (err) {
    return errorFxn(MiddlewareErrorCode.FAILURE_VERIFYING_LOBBY_JOIN);
  }
}
export const writeEndpoints = {
  createLobby,
  joinLobby,
  closeLobby,
  submitMoves,
  setNft,
  registerConfig,
};
