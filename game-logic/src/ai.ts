import type {
  AttackerStructureType,
  BuildStructureAction,
  DefenderStructureType,
  Faction,
  MatchConfig,
  MatchState,
  Structure,
  TurnAction,
} from '@tower-defense/utils';

export function generateRandomMoves(
  matchConfig: MatchConfig,
  matchState: MatchState,
  faction: Faction,
  round: number
): TurnAction[] {
  const towers: DefenderStructureType[] = ['anacondaTower', 'piranhaTower', 'slothTower'];
  const crypts: AttackerStructureType[] = ['gorillaCrypt', 'jaguarCrypt', 'macawCrypt'];
  const gold = faction === 'defender' ? matchState.defenderGold : matchState.attackerGold;
  const structures = faction === 'defender' ? towers : crypts;
  const toBuild = chooseStructures(matchConfig, matchState, faction, round, gold, structures);
  return toBuild;
}

// Repairs. Only do if tower health below 50%
// const repairs: RepairStructureAction[] = Object.values(matchState.actors.towers).reduce(
//   (acc: RepairStructureAction[], item) => {
//     const config = matchConfig[item.structure];
//     const isAffordable = matchConfig.repairCost < gold;
//     const dying = item.health < (config[1].health / 2);
//     if (dying && isAffordable){
//       gold -= matchConfig.repairCost // substract from gold so further iterations compare with substracted amount
//       return [...acc, {
//         action: "repair",
//         faction: "defender",
//         id: item.id,a
//         round: matchState.currentRound // + 1?
//       }]
//     }
//     else return acc;
//   },
//   []
// );
// Build. Do on lanes in which we are outnumbered
// const lanes = [];
// const losingLanes = lanes.reduce((acc, item) => {
//   const cryptsInLane = findCryptsInlane(l);
//   const towersInLane = findTowersInlane(l);
//   if (towersInLane < cryptsInLane.length) return [...acc,
//   chooseTowersToBuild(matchConfig, matchState, gold)
//   ]
//   else return acc
// }, [])

function chooseStructures(
  matchConfig: MatchConfig,
  matchState: MatchState,
  faction: Faction,
  round: number,
  budget: number,
  choices: Structure[]
): BuildStructureAction[] {
  const usableTileIndices = matchState.map.reduce(
    (tiles, item, index) =>
      item.type === 'open' && item.faction === faction ? [...tiles, index] : tiles,
    [] as number[]
  );
  const actors = faction === 'attacker' ? matchState.actors.crypts : matchState.actors.towers;
  Object.values(actors).forEach(structure => {
    usableTileIndices.splice(usableTileIndices.indexOf(structure.coordinates), 1);
  });

  let currentBudget = budget;
  const actions: BuildStructureAction[] = [];
  while (currentBudget > 0) {
    const structure = choices[Math.floor(Math.random() * choices.length)];
    const price = matchConfig[structure][1].price;
    if (currentBudget < price || usableTileIndices.length === 0) break;

    const coordinates = usableTileIndices[Math.floor(Math.random() * usableTileIndices.length)];
    const action: BuildStructureAction = {
      action: 'build',
      structure,
      coordinates,
      faction,
      round,
    };

    actions.push(action);
    currentBudget -= price;
    usableTileIndices.splice(usableTileIndices.indexOf(coordinates), 1);
  }
  return actions;
}
