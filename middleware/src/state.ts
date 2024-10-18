import { getStorageAddress, getBackendUri, getBatcherUri } from '@paima/mw-core';
import type { MiddlewareConnectionDetails } from './types';

export const getConnectionDetails = (): MiddlewareConnectionDetails => ({
  storageAddress: getStorageAddress(),
  backendUri: getBackendUri(),
  batcherUri: getBatcherUri(),
});
