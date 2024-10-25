import { LoginInfo, paimaEndpoints, Wallet, WalletConnectHelper } from '@paima/mw-core';
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

import { LocalWallet } from '@thirdweb-dev/wallets';
import { AddressType, Result } from '@paima/utils';

initMiddlewareCore(GAME_NAME, gameBackendVersion);

const localWallet = new LocalWallet({
  walletId: 'paima-tower-defense-wallet',
});
const localWalletReady = localWallet.loadOrCreate({
  strategy: 'privateKey',
  encryption: {
    password: 'paima-tower-defense-wallet-password',
  },
});

const endpoints = {
  ...paimaEndpoints,
  ...queryEndpoints,
  ...writeEndpoints,

  async userWalletLogin(name: string): Promise<Result<Wallet>> {
    /*
    let loginInfo: LoginInfo = {
      mode: WalletMode.EvmInjected,
      preferBatchedMode: false,
      preference: {
        name,
      },
      checkChainId: false,
    };
    */

    await localWalletReady;

    let loginInfo: LoginInfo = {
      mode: WalletMode.EvmEthers,
      preferBatchedMode: true,
      connection: {
        metadata: {
          name: 'thirdweb.localwallet',
          displayName: 'Local Wallet',
        },
        // type pun from ethers@5 to ethers@6 Signer
        api: (await localWallet.getSigner()) as any,
      },
    };

    return await paimaEndpoints.userWalletLogin(loginInfo);
  },

  async externalWalletConnect(name: string): Promise<object> {
    await localWalletReady;

    await new WalletConnectHelper().connectExternalWalletAndSign(
      AddressType.EVM,
      name,
      await localWallet.getAddress()
    );

    return {};
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
