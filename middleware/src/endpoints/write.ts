import { retryPromise } from '@paima/utils';
import { builder } from '@paima/concise';

import { buildEndpointErrorFxn, MiddlewareErrorCode } from '../errors';
import {
  getLobbyStateWithUser,
  getNonemptyNewLobbies,
  getUserConfigs,
} from '../helpers/auxiliary-queries';
import { moveToString, userCreatedLobby, userJoinedLobby } from '../helpers/utility-functions';
import type { CreateLobbyResponse, OldResult, Result } from '../types';
import { GameENV, configToConcise } from '@tower-defense/utils';
import type {
  MatchConfig,
  Faction,
  MapName,
  TurnAction,
  BotDifficulty,
} from '@tower-defense/utils';
import type { EndpointErrorFxn } from '@paima/mw-core';
import {
  awaitBlock,
  getActiveAddress,
  PaimaMiddlewareErrorCode,
  postConciseData,
} from '@paima/mw-core';
import { WalletMode } from '@paima/providers';

const RETRY_PERIOD = 1000;
const RETRIES_COUNT = 8;

const getUserWallet = (errorFxn: EndpointErrorFxn): Result<string> => {
  try {
    const wallet = getActiveAddress(WalletMode.EvmInjected);
    if (wallet.length === 0) {
      return errorFxn(PaimaMiddlewareErrorCode.WALLET_NOT_CONNECTED);
    }
    return { result: wallet, success: true };
  } catch (err) {
    return errorFxn(PaimaMiddlewareErrorCode.INTERNAL_INVALID_POSTING_MODE, err);
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
  botDifficulty: BotDifficulty;
  hasAutoplay: boolean;
}

async function createLobby(json: string): Promise<CreateLobbyResponse> {
  const errorFxn = buildEndpointErrorFxn('createLobby');

  const query = getUserWallet(errorFxn);
  if (!query.success) return query;
  const userWalletAddress = query.result;
  const params: CreateLobbyParams = JSON.parse(json);
  const { presetName, role } = params;
  const configName =
    presetName === 'short'
      ? GameENV.SHORT_CONFIG
      : presetName === 'medium'
      ? GameENV.MEDIUM_CONFIG
      : presetName === 'long'
      ? GameENV.LONG_CONFIG
      : 'defaultdefault';
  const roleEncoding =
    role === 'attacker' ? 'a' : role === 'defender' ? 'd' : role === 'random' ? 'r' : 'r';

  const conciseBuilder = builder.initialize();
  conciseBuilder.setPrefix('c');
  conciseBuilder.addValues([
    { value: configName },
    { value: roleEncoding },
    { value: params.numberOfRounds.toString(10) },
    { value: params.roundLength.toString(10) },
    { value: params.isHidden ? 'T' : 'F' },
    { value: params.mapName },
    { value: params.isPractice ? 'T' : 'F' },
    { value: params.hasAutoplay ? 'T' : 'F' },
    { value: params.botDifficulty },
  ]);

  const response = await postConciseData(conciseBuilder.build(), errorFxn);
  if (!response.success) return response;
  const currentBlock = response.blockHeight;

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

  const response = await postConciseData(conciseBuilder.build(), errorFxn);
  if (!response.success) return response;
  const currentBlock = response.blockHeight;

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

  const response = await postConciseData(conciseBuilder.build(), errorFxn);
  if (!response.success) return response;
  const currentBlock = response.blockHeight;

  try {
    await awaitBlock(currentBlock);
    const lobbyState = await retryPromise(
      () => getLobbyStateWithUser(lobbyID, userWalletAddress),
      RETRY_PERIOD,
      RETRIES_COUNT
    );
    if (!userCreatedLobby(userWalletAddress, lobbyState)) {
      return errorFxn(MiddlewareErrorCode.CANNOT_CLOSE_SOMEONES_LOBBY);
    }
    return { success: true, message: '' };
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

  const conciseBuilder = builder.initialize();
  conciseBuilder.setPrefix('s');
  conciseBuilder.addValue({ value: lobbyID, isStateIdentifier: true });
  conciseBuilder.addValue({ value: roundNumber.toString(10) });

  try {
    conciseBuilder.addValues(moves.map(m => ({ value: moveToString(m) })));
  } catch (err) {
    return errorFxn(MiddlewareErrorCode.SUBMIT_MOVES_INVALID_MOVES, err);
  }

  const response = await postConciseData(conciseBuilder.build(), errorFxn);
  if (!response.success) return response;
  return { success: true, message: '' };
}

async function setNft(nftAddress: string, nftId: number): Promise<OldResult> {
  const errorFxn = buildEndpointErrorFxn('setNft');

  const query = getUserWallet(errorFxn);
  if (!query.success) return query;

  const conciseBuilder = builder.initialize();
  conciseBuilder.setPrefix('n');
  conciseBuilder.addValue({ value: nftAddress });
  conciseBuilder.addValue({ value: nftId.toString(10) });

  const response = await postConciseData(conciseBuilder.build(), errorFxn);
  if (!response.success) return response;
  return { success: true, message: '' };
}

async function registerConfig(config: MatchConfig): Promise<any> {
  const errorFxn = buildEndpointErrorFxn('joinLobby');

  const query = getUserWallet(errorFxn);
  if (!query.success) return query;
  const userWalletAddress = query.result;

  const conciseBuilder = builder.initialize();
  conciseBuilder.setPrefix('r');
  conciseBuilder.addValue({ value: '1', isStateIdentifier: false });
  const configString = configToConcise(config);
  conciseBuilder.addValue({ value: configString, isStateIdentifier: false });
  const finalString = conciseBuilder.build();

  const response = await postConciseData(finalString, errorFxn);
  if (!response.success) return response;
  const currentBlock = response.blockHeight;

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
      return errorFxn(MiddlewareErrorCode.FAILURE_VERIFYING_CONFIG_REGISTER);
    }
  } catch (err) {
    return errorFxn(MiddlewareErrorCode.FAILURE_VERIFYING_CONFIG_REGISTER, err);
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
