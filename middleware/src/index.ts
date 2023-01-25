import { accountsEndpoints } from './endpoints/accounts';
import { queryEndpoints } from './endpoints/queries';
import { writeEndpoints } from './endpoints/write';
import {
  cardanoWalletLoginEndpoint,
  getMiddlewareConfig,
  switchToBatchedCardanoMode,
  switchToBatchedEthMode,
  switchToUnbatchedMode,
  userWalletLoginWithoutChecks,
} from './endpoints/internal';

import { getRemoteBackendVersion } from './helpers/auxiliary-queries';
import { postString } from './helpers/contract-interaction';

import { mockEndpoints } from './endpoints/mock';
const endpoints = {
  // ...accountsEndpoints,
  ...mockEndpoints,
  // ...queryEndpoints,
  // ...writeEndpoints,
};

export * from './types';
export {
  getMiddlewareConfig,
  userWalletLoginWithoutChecks,
  cardanoWalletLoginEndpoint,
  switchToUnbatchedMode,
  switchToBatchedEthMode,
  switchToBatchedCardanoMode,
  getRemoteBackendVersion,
  postString,
};

export default endpoints;
