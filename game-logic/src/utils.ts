import type {
  AttackerStructure,
  DefenderStructure,
  MatchConfig,
  StructureUpgradeTier,
} from '@tower-defense/utils';

export const calculateRecoupGold = (
  { structure, upgrades }: AttackerStructure | DefenderStructure,
  config: MatchConfig
): number => {
  const structureConfigGraph = config[structure];

  let price = 0;
  for (let tier = 1; tier <= upgrades; tier++) {
    price += structureConfigGraph[tier as StructureUpgradeTier].price;
  }
  return Math.floor((config.recoupPercentage / 100) * price);
};
