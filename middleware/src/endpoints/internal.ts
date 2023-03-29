import { gameBackendVersion } from '@tower-defense/utils';
import { getConnectionDetails } from '../state';
import type { MiddlewareConfig } from '../types';

export function getMiddlewareConfig(): MiddlewareConfig {
  return {
    ...getConnectionDetails(),
    localVersion: gameBackendVersion,
  };
}
