import type { SQLUpdate } from 'paima-engine/paima-db';
import type { WalletAddress } from 'paima-engine/paima-utils';

import type { INewNftParams } from '@tower-defense/db';
import { newNft } from '@tower-defense/db';

import type { SetNFTInput } from '../types';

// Persists the submitted data from a `Set NFT` game input
export function persistNFT(
  user: WalletAddress,
  blockHeight: number,
  inputData: SetNFTInput
): SQLUpdate {
  const params: INewNftParams = {
    wallet: user,
    block_height: blockHeight,
    address: inputData.address,
    token_id: inputData.tokenID,
    timestamp: new Date(),
  };
  return [newNft, params];
}
