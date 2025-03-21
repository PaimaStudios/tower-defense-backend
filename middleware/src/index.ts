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
import { allInjectedWallets, WalletMode } from '@paima/providers';

import { LocalWallet } from '@thirdweb-dev/wallets';
import { AddressType, Result } from '@paima/utils';
import { indexerQueryAccount } from './helpers/query-constructors';

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

const detectedWallets: Map<string, AddressType> = new Map();

interface UserWalletLoginResult extends Wallet {
  currentConnections: number,
  detectedWallets: string[],
}

interface ExternalConnectResult extends PostDataResponse {
  currentConnections: number,
}

const endpoints = {
  ...paimaEndpoints,
  ...queryEndpoints,
  ...writeEndpoints,

  async userWalletLogin(name: string): Promise<Result<UserWalletLoginResult>> {
    const result = await localWalletResult;
    if (!result.success) {
      return result;
    }

    const all = await allInjectedWallets({
      gameName: GAME_NAME,
      gameChainId: undefined,
    });
    console.log('allInjectedWallets =', all);

    detectedWallets.clear();
    for (let wallet of all[WalletMode.EvmInjected]) {
      detectedWallets.set(wallet.metadata.displayName, AddressType.EVM);
    }
    for (let wallet of all[WalletMode.Cardano]) {
      detectedWallets.set(wallet.metadata.displayName, AddressType.CARDANO);
    }

    let currentConnections = 0;
    try {
      const response = await fetch(indexerQueryAccount(result.result.walletAddress));
      currentConnections = (await response.json()).response.currentConnections;
    } catch (err) {
      console.error('currentConnections', err);
    }

    return {
      success: true,
      result: {
        ...result.result,
        currentConnections,
        detectedWallets: [...detectedWallets.keys()],
      }
    };
  },

  async externalWalletConnect(name: string): Promise<Result<ExternalConnectResult>> {
    await localWalletReady;

    const localWalletAddress = await localWallet.getAddress();
    const externalSignsLocal = await new WalletConnectHelper().connectExternalWalletAndSign(
      detectedWallets.get(name) ?? AddressType.EVM,
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

    if (!posted.success) {
      return posted;
    }

    let currentConnections = 0;
    try {
      const response = await fetch(indexerQueryAccount(localWalletAddress));
      currentConnections = (await response.json()).response.currentConnections;
    } catch (err) {
      console.error('currentConnections', err);
    }

    return { success: true, result: { ...posted.result, currentConnections } };
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
