import { accountsEndpoints } from './endpoints/accounts';
import { queryEndpoints } from './endpoints/queries';
import { writeEndpoints } from './endpoints/write';
import { utilityEndpoints } from './endpoints/utility';

import {
  cardanoWalletLoginEndpoint,
  getMiddlewareConfig,
  switchToBatchedCardanoMode,
  switchToBatchedEthMode,
  switchToUnbatchedMode,
  switchToAutomaticMode,
  userWalletLoginWithoutChecks,
  automaticWalletLogin,
  updateBackendUri,
} from './endpoints/internal';

import { getRemoteBackendVersion } from './helpers/auxiliary-queries';
import { postString } from './helpers/posting';

import { initAccountGuard } from './helpers/wallet-metamask';

initAccountGuard();

const endpoints = {
  ...accountsEndpoints,
  ...queryEndpoints,
  ...utilityEndpoints,
  ...writeEndpoints,
};

export * from './types';
export {
  getMiddlewareConfig,
  userWalletLoginWithoutChecks,
  cardanoWalletLoginEndpoint,
  switchToUnbatchedMode,
  switchToBatchedEthMode,
  switchToBatchedCardanoMode,
  switchToAutomaticMode,
  automaticWalletLogin,
  updateBackendUri,
  getRemoteBackendVersion,
  postString,
};

export default endpoints;
