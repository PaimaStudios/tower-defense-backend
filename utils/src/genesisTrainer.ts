import { ENV } from "@paima/utils";

export const cdeName = "EVM Genesis Trainer";

export function getContractAddress(): string {
  // TODO: un-hardcode contract address.
  return '0xe7f1725e7734ce288f8367e1bb143e90bb3f0512';
}

export function getNftMetadata(id: bigint | number) {
  // Save on having to hit IPFS here by hardcoding stuff.
  return {
    // The frontend doesn't actually use this.
    name: `Genesis Trainer #${id}`,
    // See TrainerImageController.
    image: `${ENV.BACKEND_URI}/trainer-image/${id}.png`,
  };
}
