import { buildEndpointErrorFxn, CatapultMiddlewareErrorCode, FE_ERR_METAMASK_NOT_INSTALLED } from '../errors';
import { localRemoteVersionsCompatible } from '../helpers/auxiliary-queries';
import { updateFee } from '../helpers/posting';
import {
  checkEthWalletStatus,
  rawWalletLogin,
  switchChain,
  verifyWalletChain,
} from '../helpers/wallet-metamask';
import {
  setEthAddress,
} from '../state';
import { Result, OldResult, Wallet } from '../types';

// Wrapper function for all wallet status checking functions
async function checkWalletStatus(): Promise<OldResult> {
  // TODO: Add checkCardanoWalletStatus() and branching logic
  return checkEthWalletStatus();
}

// Core "login" function which tells the frontend whether the user has a wallet in a valid state
// thus allowing the game to get past the login screen
async function userWalletLogin(): Promise<Result<Wallet>> {
  const errorFxn = buildEndpointErrorFxn('userWalletLogin');

  if (typeof window.ethereum === 'undefined') {
    return errorFxn(CatapultMiddlewareErrorCode.METAMASK_NOT_INSTALLED, undefined, FE_ERR_METAMASK_NOT_INSTALLED);
  }

  let account: string;
  try {
    account = await rawWalletLogin();
  } catch (err) {
    return errorFxn(CatapultMiddlewareErrorCode.METAMASK_LOGIN);
  }
  const userWalletAddress = account;

  try {
    await updateFee();
  } catch (err) {
    errorFxn(CatapultMiddlewareErrorCode.ERROR_UPDATING_FEE, err);
    // The fee has a default value, so this is not fatal and we can continue.
    // If the fee has increased beyond the default value, posting won't work.
  }
  try {
    if (!(await verifyWalletChain())) {
      if (!(await switchChain())) {
        return errorFxn(CatapultMiddlewareErrorCode.METAMASK_CHAIN_SWITCH);
      }
    }
  } catch (err) {
    return errorFxn(CatapultMiddlewareErrorCode.METAMASK_CHAIN_SWITCH, err);
  }

  try {
    if (!(await localRemoteVersionsCompatible())) {
      return errorFxn(CatapultMiddlewareErrorCode.BACKEND_VERSION_INCOMPATIBLE);
    }
  } catch (err) {
    return errorFxn(CatapultMiddlewareErrorCode.ERROR_QUERYING_BACKEND_ENDPOINT, err);
  }

  setEthAddress(userWalletAddress);
  return {
    success: true,
    result: {
      walletAddress: userWalletAddress,
    }
  };
}

export const accountsEndpoints = {
  userWalletLogin,
  checkWalletStatus
};
