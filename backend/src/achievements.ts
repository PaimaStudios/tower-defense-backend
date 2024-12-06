import { AchievementMetadata } from '@paima/utils-backend';

export enum AchievementNames {
  // Easy free
  win_first_match = 'win_first_match',
  // Medium free
  defend_with_half_hp = 'defend_with_half_hp', // as defender
  attack_before_final_round = 'attack_before_final_round', // as attacker
  // Medium paid
  ranked_win = 'ranked_win',
  ranked_spend_less_gold = 'ranked_spend_less_gold',
  ranked_destroy_towers = 'ranked_destroy_towers', // as attacker
  ranked_kill_undead = 'ranked_kill_undead', // as defender
  ranked_games_played = 'ranked_games_played',
  // Hard paid
  ranked_three_in_a_row = 'ranked_three_in_a_row',
  ranked_win_every_position = 'ranked_win_every_position',
}

export const AchievementAmounts = {
  ranked_destroy_towers: 20,
  ranked_games_played: 25,
  ranked_kill_undead: 10_000, // 700ish in a match is typical, so this is ~15 matches
  ranked_spend_less_gold: 900,
} as const;

export const metadata = {
  game: {
    id: 'paima-wrath-of-the-jungle-tower-defense',
    name: 'Wrath of the Jungle: Tower Defense',
  },
  list: [
    // Easy free
    {
      name: AchievementNames.win_first_match,
      isActive: true,
      displayName: 'Welcome to the Jungle',
      description: 'Secure your first win (singleplayer and unranked included).',
    },
    // Medium free
    {
      name: AchievementNames.defend_with_half_hp,
      isActive: true,
      displayName: 'The Best Defense',
      description: 'Win as defender with at least half your health remaining (unranked included).',
    },
    {
      name: AchievementNames.attack_before_final_round,
      isActive: true,
      displayName: 'Like Undead Lightning',
      description: 'Win as attacker before the final round (unranked included).',
    },
    // Medium paid
    {
      name: AchievementNames.ranked_win,
      isActive: true,
      displayName: 'Rope Ladder Climber',
      description: 'Secure your first ranked win.',
    },
    {
      name: AchievementNames.ranked_spend_less_gold,
      isActive: true,
      displayName: 'Combat Conservationist',
      description: `Win a ranked game spending less than ${AchievementAmounts.ranked_spend_less_gold} gold.`,
    },
    {
      name: AchievementNames.ranked_destroy_towers,
      isActive: true,
      displayName: 'Parrot Patton',
      description: `Destroy ${AchievementAmounts.ranked_destroy_towers} total towers with Macaws in ranked games.`,
    },
    {
      name: AchievementNames.ranked_kill_undead,
      isActive: true,
      displayName: 'Hold The Line!',
      description: `Kill ${AchievementAmounts.ranked_kill_undead} total undead in ranked games.`,
    },
    {
      name: AchievementNames.ranked_games_played,
      isActive: true,
      displayName: 'Tropical Trooper',
      description: `Finish ${AchievementAmounts.ranked_games_played} ranked games (win or lose) on a single NFT.`,
    },
    // Hard paid
    {
      name: AchievementNames.ranked_three_in_a_row,
      isActive: true,
      displayName: 'Mask Trick',
      description: 'Win three ranked matches in a row.',
    },
    {
      name: AchievementNames.ranked_win_every_position,
      isActive: true,
      displayName: 'Jungle World Tour',
      description: 'Win a ranked match as each side on each map.',
    },
  ],
} as const satisfies AchievementMetadata;
