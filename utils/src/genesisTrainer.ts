import { ENV } from '@paima/utils';
import { GameENV } from './index.js';

export enum SyntheticContractAddress {
  EVM_GENESIS_TRAINER = '0x1',
  CARDANO_GENESIS_TRAINER = '0x2',
  XAI_SENTRY_KEY = '0x3',
}

export const CDE_EVM_GENESIS_TRAINER = 'EVM Genesis Trainer';
export const CDE_CARDANO_GENESIS_TRAINER = 'Cardano Genesis Trainer';
export const CDE_XAI_SENTRY_KEY = 'Xai Sentry Key';

export function getNftMetadata(cdeName: string, id: bigint | number) {
  // Save on having to hit IPFS here by hardcoding stuff.
  switch (cdeName) {
    default:
    case CDE_EVM_GENESIS_TRAINER:
    case CDE_CARDANO_GENESIS_TRAINER:
      return {
        name: `Tarochi Genesis Trainer #${id}`,
        // See TrainerImageController.
        image: `${ENV.BACKEND_URI}/trainer-image/${id}.png`,
      };
    case CDE_XAI_SENTRY_KEY:
      return {
        name: `Xai Sentry Key #${id}`,
        // See TrainerImageController.
        image: `${GameENV.FRONTEND_URI}/TemplateData/xai.png`,
      };
  }
}

export function synthAddressToCdeName(synthAddress: string) {
  switch (synthAddress) {
    default:
    case SyntheticContractAddress.EVM_GENESIS_TRAINER:
      return CDE_EVM_GENESIS_TRAINER;
    case SyntheticContractAddress.CARDANO_GENESIS_TRAINER:
      return CDE_CARDANO_GENESIS_TRAINER;
    case SyntheticContractAddress.XAI_SENTRY_KEY:
      return CDE_XAI_SENTRY_KEY;
  }
}
