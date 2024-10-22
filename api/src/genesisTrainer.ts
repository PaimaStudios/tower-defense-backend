import { ENV } from "@paima/utils";

export function getNftMetadata(id: bigint | number) {
  // Save on having to hit IPFS here by hardcoding stuff.
  return {
    // The frontend doesn't actually use this.
    name: `Genesis Trainer #${id}`,
    // See TrainerImageController.
    image: `${ENV.BACKEND_URI}/trainer-image/${id}.png`,
  };
}
