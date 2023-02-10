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

const endpoints = {
  ...accountsEndpoints,
  ...queryEndpoints,
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
  getRemoteBackendVersion,
  postString,
};

export default endpoints;
