import { gameBackendVersion, URI } from '@tower-defense/utils';
import { buildEndpointErrorFxn, CatapultMiddlewareErrorCode, errorMessageFxn } from '../errors';
import { cardanoLogin } from '../helpers/wallet-cardano';
import { rawWalletLogin } from '../helpers/wallet-metamask';
import { connectWallet as connectTruffleWallet } from '../helpers/wallet-truffle';
import {
  getCardanoAddress,
  getConnectionDetails,
  getPostingInfo,
  getTruffleAddress,
  setAutomaticMode,
  setBackendUri,
  setBatchedCardanoMode,
  setBatchedEthMode,
  setEthAddress,
  setUnbatchedMode,
} from '../state';
import { FailedResult, MiddlewareConfig, PostingModeSwitchResult, Result, Wallet } from '../types';

export function getMiddlewareConfig(): MiddlewareConfig {
  return {
    ...getConnectionDetails(),
    localVersion: gameBackendVersion,
  };
}

export async function userWalletLoginWithoutChecks(): Promise<Result<Wallet>> {
  const errorFxn = buildEndpointErrorFxn('userWalletLoginWithoutChecks');
  let account: string;
  try {
    account = await rawWalletLogin();
  } catch (err) {
    return errorFxn(CatapultMiddlewareErrorCode.METAMASK_LOGIN);
  }
  const userWalletAddress = account;

  setEthAddress(userWalletAddress);
  return {
    success: true,
    result: {
      walletAddress: userWalletAddress,
    }
  };
}

export async function cardanoWalletLoginEndpoint(): Promise<Result<Wallet>> {
  const errorFxn = buildEndpointErrorFxn('cardanoWalletLoginEndpoint');
  try {
    await cardanoLogin(); 
    return {
      success: true,
      result: {
        walletAddress: getCardanoAddress(),
      }
    };
  } catch (err) {
    return errorFxn(CatapultMiddlewareErrorCode.CARDANO_LOGIN, err);
  }
}

export async function automaticWalletLogin(privateKey: string): Promise<Result<Wallet>> {
  const errorFxn = buildEndpointErrorFxn('automaticWalletLogin');
  try {
    await connectTruffleWallet(privateKey);
    return {
      success: true,
      result: {
        walletAddress: getTruffleAddress(),
      }
    };
  } catch (err) {
    return errorFxn(CatapultMiddlewareErrorCode.TRUFFLE_LOGIN, err);
  }
}

export async function switchToUnbatchedMode(): Promise<PostingModeSwitchResult> {
  setUnbatchedMode();
  return {
    success: true,
    ...getPostingInfo(),
  };
}

export async function switchToBatchedEthMode(): Promise<PostingModeSwitchResult> {
  setBatchedEthMode();
  return {
    success: true,
    ...getPostingInfo(),
  };
}

export async function switchToBatchedCardanoMode(): Promise<PostingModeSwitchResult> {
  setBatchedCardanoMode();
  return {
    success: true,
    ...getPostingInfo(),
  };
}

export async function switchToAutomaticMode(): Promise<PostingModeSwitchResult> {
  setAutomaticMode();
  return {
    success: true,
    ...getPostingInfo()
  };
}

export async function updateBackendUri(newUri: URI) {
  setBackendUri(newUri);
}
