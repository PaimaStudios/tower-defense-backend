import pkg from 'web3-utils';
const { utf8ToHex } = pkg;

import { cardanoConnected, getCardanoApi, setCardanoAddress, setCardanoApi } from '../state';

export async function cardanoLogin(): Promise<void> {
  if (cardanoConnected()) {
    return;
  }
  const api = await (window as any).cardano.enable();
  setCardanoApi(api);
  const addresses = await api.getUsedAddresses();
  const userAddress = addresses[0];
  setCardanoAddress(userAddress);
}

export async function signMessageCardano(userAddress: string, message: string): Promise<string> {
  await cardanoLogin();
  const api = getCardanoApi();
  const hexMessage = utf8ToHex(message).slice(2);
  return api.signData(userAddress, hexMessage);
}
