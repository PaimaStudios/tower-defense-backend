import {
  AttackerStructure,
  AttackerStructureType,
  BuildStructureAction,
  DefenderStructure,
  DefenderStructureType,
  Faction,
  MatchConfig,
  MatchState,
  RepairStructureAction,
  Structure,
  Tile,
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
  console.log(gold, 'generating moves');
  const toBuild = chooseStructures(
    matchConfig,
    matchState.mapState,
    faction,
    round,
    gold,
    structures
  );
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
  map: Tile[],
  faction: Faction,
  round: number,
  budget: number,
  choices: Structure[],
  chosen: BuildStructureAction[] = []
): BuildStructureAction[] {
  const structure = choices[Math.floor(Math.random() * choices.length)];
  const price = matchConfig[structure][1].price;
  if (budget >= price) {
    const usableTileIndices = map.reduce(
      (acc: number[], item, index) =>
        item.type === 'open' && item.faction === faction ? [...acc, index] : acc,
      []
    );
    const coordinates = Math.floor(Math.random() * usableTileIndices.length);
    const newMap: Tile[] = [
      ...map.slice(0, coordinates),
      { type: 'unbuildable', faction },
      ...map.slice(coordinates + 1),
    ];
    const action: BuildStructureAction = {
      action: 'build',
      structure,
      coordinates,
      faction,
      round,
    };
    return chooseStructures(matchConfig, newMap, faction, round, budget - price, choices, [
      ...chosen,
      action,
    ]);
  } else return chosen;
}
