import { paimaEndpoints } from 'paima-engine/paima-mw-core';
import {
  initMiddlewareCore,
  cardanoWalletLoginEndpoint,
  retrievePostingInfo,
  switchToBatchedCardanoMode,
  switchToBatchedEthMode,
  switchToBatchedPolkadotMode,
  switchToUnbatchedMode,
  switchToAutomaticMode,
  userWalletLoginWithoutChecks,
  automaticWalletLogin,
  updateBackendUri,
  getRemoteBackendVersion,
  sendEvmWalletTransaction,
  signMessageCardano,
  postConciselyEncodedData,
  polkadotLoginRaw,
  signMessagePolkadot,
} from 'paima-engine/paima-mw-core';
import type { PostingModeSwitchResult } from 'paima-engine/paima-mw-core';

import { gameBackendVersion, GAME_NAME } from '@tower-defense/utils';

import { queryEndpoints } from './endpoints/queries';
import { writeEndpoints } from './endpoints/write';

import { getMiddlewareConfig } from './endpoints/internal';

initMiddlewareCore(GAME_NAME, gameBackendVersion);

const endpoints = {
  ...paimaEndpoints,
  ...queryEndpoints,
  ...writeEndpoints,
};

export * from './types';
export {
  getMiddlewareConfig,
  userWalletLoginWithoutChecks,
  cardanoWalletLoginEndpoint,
  retrievePostingInfo,
  switchToUnbatchedMode,
  switchToBatchedEthMode,
  switchToBatchedCardanoMode,
  switchToBatchedPolkadotMode,
  switchToAutomaticMode,
  automaticWalletLogin,
  updateBackendUri,
  getRemoteBackendVersion,
  sendEvmWalletTransaction,
  signMessageCardano,
  postConciselyEncodedData,
  polkadotLoginRaw,
  signMessagePolkadot,
  PostingModeSwitchResult,
};

export default endpoints;
