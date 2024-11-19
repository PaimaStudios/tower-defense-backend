import { AchievementMetadata } from "@paima/utils-backend";

export enum AchievementNames {
  WIN_RANKED_WITH_NFT = 'win_ranked_with_nft',
}

export const metadata: AchievementMetadata = {
  game: {
    id: 'paima-wrath-of-the-jungle-tower-defense',
    name: 'Wrath of the Jungle: Tower Defense',
  },
  list: [
    {
      name: AchievementNames.WIN_RANKED_WITH_NFT,
      displayName: 'A Winner Is You',
      isActive: true,
      description: 'Win a ranked match with an NFT'
    }
  ]
};
