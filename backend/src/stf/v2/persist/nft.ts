import type { SQLUpdate } from '@paima/db';
import type { WalletAddress } from '@paima/chain-types';

import type { INewNftParams } from '@tower-defense/db';
import { newNft } from '@tower-defense/db';

import type { SetNFTInput } from '../types';
import { synthAddressToCdeName } from '@tower-defense/utils';

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
    cde_name: synthAddressToCdeName(inputData.address),
    token_id: inputData.tokenID,
    timestamp: new Date(),
  };
  return [newNft, params];
}
