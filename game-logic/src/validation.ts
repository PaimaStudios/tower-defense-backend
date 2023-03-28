import type { TurnAction, Faction, MatchState, Structure } from '@tower-defense/utils';

export function validateMoves(
  actions: TurnAction[],
  faction: Faction,
  matchState: MatchState
): boolean {
  console.log("validating moves")
  const res = actions.reduce((acc, item) => {
    if (item.action === 'build')
      return canBuild(faction, item.coordinates, item.structure, matchState) ? acc : false;
    else return hasStructure(faction, item.id, matchState) ? acc : false;
  }, true);
  return res;
}
// Helper function to see if a structure is being built in an available tile
function canBuild(
  faction: Faction,
  coords: number,
  structure: Structure,
  matchState: MatchState
): boolean {
  console.log(structure, "structure")
  const structureFaction = structure.includes('rypt') ? 'attacker' : 'defender';
  console.log(structureFaction, "structure faction")
  const tile = matchState.mapState[coords];
  console.log(tile, "tile")
  return tile.type === 'open' && tile.faction === faction && faction === structureFaction;
}
// Helper function to see if structure ID is on the matchState actor map
function hasStructure(faction: Faction, id: number, matchState: MatchState): boolean {
  if (faction === 'attacker') return !!matchState.actors.crypts[id];
  else return !!matchState.actors.towers[id];
}
