import type { URI } from '@tower-defense/utils';
import { GameENV } from '@tower-defense/utils';
import { getStorageAddress, getBackendUri, getBatcherUri } from 'paima-engine/paima-mw-core';
import type { MiddlewareConnectionDetails } from './types';

const indexerUri: URI = GameENV.INDEXER_URI;
const statefulUri: URI = GameENV.STATEFUL_URI;

export const getIndexerUri = (): URI => indexerUri;
export const getStatefulUri = (): URI => statefulUri;

export const getConnectionDetails = (): MiddlewareConnectionDetails => ({
  storageAddress: getStorageAddress(),
  backendUri: getBackendUri(),
  indexerUri: getIndexerUri(),
  statefulUri: getStatefulUri(),
  batcherUri: getBatcherUri(),
});
