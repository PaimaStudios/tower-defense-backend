import {
  AttackerStructure,
  DefenderStructure,
  Faction,
  MatchConfig,
  MatchState,
  RepairStructureAction,
  TurnAction,
} from '@tower-defense/utils';

export function generateRandomMoves(
  matchConfig: MatchConfig,
  matchState: MatchState,
  faction: Faction
): TurnAction[] {

  return [];
}
// function defenderMoves(
//   matchConfig: MatchConfig,
//   matchState: MatchState){
//   // Repairs. Only do if tower health below 50%
//   let gold = matchState.defenderGold;
//   const repairs: RepairStructureAction[] = Object.values(matchState.actors.towers).reduce(
//     (acc: RepairStructureAction[], item) => {
//       const config = matchConfig[item.structure];
//       const isAffordable = matchConfig.repairCost < gold;
//       const dying = item.health < (config[1].health / 2);
//       if (dying && isAffordable){
//         gold -= matchConfig.repairCost // substract from gold so further iterations compare with substracted amount
//         return [...acc, {
//           action: "repair",
//           faction: "defender",
//           id: item.id,
//           round: matchState.currentRound // + 1?
//         }]
//       }
//       else return acc;
//     },
//     []
//   );
//   // Build. Do on lanes in which we are outnumbered
//   const lanes = [];
//   const losingLanes = lanes.reduce((acc, item) => {
//     const cryptsInLane = findCryptsInlane(l);
//     const towersInLane = findTowersInlane(l);
//     if (towersInLane < cryptsInLane.length) return [...acc, 
//     chooseTowersToBuild(matchConfig, matchState, gold)
//     ]
//     else return acc
//   }, [])
// }
// function chooseTowersToBuild(
//   matchConfig: MatchConfig,
//   matchState: MatchState, 
//   gold: number
// ){
  
// }