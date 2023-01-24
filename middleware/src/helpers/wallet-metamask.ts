import { MetaMaskInpageProvider } from '@metamask/providers';
import { utf8ToHex } from 'web3-utils';

import { buildEndpointErrorFxn, CatapultMiddlewareErrorCode } from '../errors';
import { getChainId, getChainName, getChainUri } from '../state';

export interface Window {
  ethereum: MetaMaskInpageProvider;
}

interface MetamaskSwitchError {
  code: number;
}

export async function rawWalletLogin(): Promise<string> {
  const accounts = (await (window as any as Window).ethereum.request({
    method: 'eth_requestAccounts',
  })) as string[];
  if (!accounts || accounts.length === 0) {
    throw new Error('Unknown error while receiving accounts');
  }
  return accounts[0];
}

export async function switchChain(): Promise<boolean> {
  const errorFxn = buildEndpointErrorFxn('switchChain');

  const CHAIN_NOT_ADDED_ERROR_CODE = 4902;
  const hexChainId = '0x' + getChainId().toString(16);

  try {
    await (window as any as Window).ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: hexChainId }],
    });
  } catch (switchError) {
    // This error code indicates that the chain has not been added to MetaMask.
    const se = switchError as MetamaskSwitchError;
    if (se.hasOwnProperty('code') && se.code === CHAIN_NOT_ADDED_ERROR_CODE) {
      try {
        await (window as any as Window).ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: hexChainId,
              chainName: getChainName(),
              rpcUrls: [getChainUri()],
            },
          ],
        });
        return true;
      } catch (addError) {
        errorFxn(CatapultMiddlewareErrorCode.ERROR_ADDING_CHAIN, addError);
        return false;
      }
    } else {
      errorFxn(CatapultMiddlewareErrorCode.ERROR_SWITCHING_TO_CHAIN, switchError);
      return false;
    }
  }
  return true;
}

export async function verifyWalletChain(): Promise<boolean> {
  try {
    return (window as any as Window).ethereum
      .request({ method: 'eth_chainId' })
      .then(res => parseInt(res as string) === getChainId());
  } catch (e) {
    console.error(e);
    return false;
  }
}

export async function signMessageEth(userAddress: string, message: string): Promise<string> {
  const hexMessage = utf8ToHex(message);
  return (window as any).ethereum.request({
    method: 'personal_sign',
    params: [hexMessage, userAddress, ''],
  });
}
