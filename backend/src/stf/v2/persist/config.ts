import type { ICreateConfigParams } from '@tower-defense/db';
import { createConfig } from '@tower-defense/db';
import type { SQLUpdate } from 'paima-engine/paima-db';
import type Prando from 'paima-engine/paima-prando';
import type { WalletAddress } from 'paima-engine/paima-utils';
import type { RegisteredConfigInput } from '../types';

export function persistConfigRegistration(
  user: WalletAddress,
  inputData: RegisteredConfigInput,
  randomnessGenerator: Prando
): SQLUpdate {
  const config_id = randomnessGenerator.nextString(14);
  const params: ICreateConfigParams = {
    id: config_id,
    creator: user,
    content: inputData.content,
    version: inputData.version,
  };
  return [createConfig, params];
}
