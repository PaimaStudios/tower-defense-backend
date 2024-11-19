import { AchievementMetadata } from "@paima/utils-backend";

export enum AchievementNames {
  // Easy free
  WIN_FIRST_MATCH = 'win_first_match',
  // Medium free
  DEFEND_WITH_HALF_HP = 'defend_with_half_hp',
  // Medium paid
  WIN_RANKED = 'win_ranked',
  // Hard paid
  WIN_EVERY_POSITION = 'win_every_position',
}

export const metadata: AchievementMetadata = {
  game: {
    id: 'paima-wrath-of-the-jungle-tower-defense',
    name: 'Wrath of the Jungle: Tower Defense',
  },
  list: [
    // Easy free
    {
      name: AchievementNames.WIN_FIRST_MATCH,
      isActive: true,
      displayName: 'Welcome to the Jungle',
      description: 'Win your first match.',
    },
    // Medium free
    {
      name: AchievementNames.DEFEND_WITH_HALF_HP,
      isActive: true,
      displayName: 'The Best Defense',
      description: 'Win as defender with at least half your health remaining.',
    },
    // Medium paid
    {
      name: AchievementNames.WIN_RANKED,
      isActive: true,
      displayName: 'Rope Ladder Climber',
      description: 'Win your first ranked match.'
    },
    // Hard paid
    {
      name: AchievementNames.WIN_EVERY_POSITION,
      isActive: true,
      displayName: 'Jungle World Tour',
      description: 'Win a ranked match as each side on each map.',
    }
  ]
};
