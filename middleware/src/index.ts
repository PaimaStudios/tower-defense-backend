import {
  LoginInfo,
  paimaEndpoints,
  PostDataResponse,
  Wallet,
  walletConnect,
  WalletConnectHelper,
} from '@paima/mw-core';
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
// Immediately start userWalletLogin to speed things up a smidge.
const localWalletResult = (async () => {
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
})();

const endpoints = {
  ...paimaEndpoints,
  ...queryEndpoints,
  ...writeEndpoints,

  async userWalletLogin(name: string): Promise<Result<Wallet>> {
    return localWalletResult;
  },

  async externalWalletConnect(name: string): Promise<Result<PostDataResponse>> {
    await localWalletReady;

    const localWalletAddress = await localWallet.getAddress();
    const externalSignsLocal = await new WalletConnectHelper().connectExternalWalletAndSign(
      AddressType.EVM,
      name,
      localWalletAddress
    );

    const toSign = new WalletConnectHelper().buildMessageToSign(externalSignsLocal.walletAddress);

    const localSignsExternal = {
      message: toSign,
      walletAddress: localWalletAddress,
      signedMessage: await localWallet.signMessage(toSign),
    };

    const posted = await walletConnect(
      externalSignsLocal.walletAddress,
      null, // 'to' is implied server-side by the submitting wallet address
      externalSignsLocal.signedMessage,
      localSignsExternal.signedMessage
    );

    return posted;
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
