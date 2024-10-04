import { LoginInfo, paimaEndpoints } from '@paima/mw-core';
import {
  initMiddlewareCore,
  userWalletLoginWithoutChecks,
  updateBackendUri,
  getRemoteBackendVersion,
  postConciselyEncodedData,
} from '@paima/mw-core';

import { gameBackendVersion, GAME_NAME } from '@tower-defense/utils';

import { queryEndpoints } from './endpoints/queries';
import { writeEndpoints } from './endpoints/write';

import { getMiddlewareConfig } from './endpoints/internal';
import { WalletMode } from '@paima/providers';

initMiddlewareCore(GAME_NAME, gameBackendVersion);

const endpoints = {
  ...paimaEndpoints,
  ...queryEndpoints,
  ...writeEndpoints,

  userWalletLogin(name: string) {
    let loginInfo: LoginInfo = {
      mode: WalletMode.EvmInjected,
      preferBatchedMode: false,
      preference: {
        name,
      },
    };

    return paimaEndpoints.userWalletLogin(loginInfo);
  },
};

export * from './types';
export {
  getMiddlewareConfig,
  userWalletLoginWithoutChecks,
  updateBackendUri,
  getRemoteBackendVersion,
  postConciselyEncodedData,
};

export default endpoints;
