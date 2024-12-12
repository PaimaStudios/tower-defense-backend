import { ENV } from "@paima/utils";

export enum SyntheticContractAddress {
  EVM_GENESIS_TRAINER = '0x1',
  CARDANO_GENESIS_TRAINER = '0x2',
  //XAI_SENTRY_KEY = '0x3',
}

export const cdeName = "EVM Genesis Trainer";

export function getNftMetadata(id: bigint | number) {
  // Save on having to hit IPFS here by hardcoding stuff.
  return {
    // The frontend doesn't actually use this.
    name: `Genesis Trainer #${id}`,
    // See TrainerImageController.
    image: `${ENV.BACKEND_URI}/trainer-image/${id}.png`,
  };
}

export function synthAddressToCdeName(synthAddress: string) {
  switch (synthAddress) {
    default:
    case SyntheticContractAddress.EVM_GENESIS_TRAINER:
      return cdeName;
    case SyntheticContractAddress.CARDANO_GENESIS_TRAINER:
      return "Cardano Genesis Trainer";
  }
}
