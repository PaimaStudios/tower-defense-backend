import type { TurnAction, Faction, MatchState, BuildStructureAction } from '@tower-defense/utils';

export function validateMoves(
  actions: TurnAction[],
  faction: Faction,
  matchState: MatchState
): boolean {
  for (const item of actions) {
    if (item.action === 'build') {
      if (!canBuild(faction, item, matchState)) return false;
    } else {
      if (!hasStructure(faction, item.id, matchState)) return false;
    }
  }
  return true;
}

/**
 * Helper function to see if a structure is being built in an available tile
 */
function canBuild(
  faction: Faction,
  { coordinates, structure }: BuildStructureAction,
  matchState: MatchState
): boolean {
  const structureFaction: Faction = structure.includes('rypt') ? 'attacker' : 'defender';
  const tile = matchState.map[coordinates];
  return tile.type === 'open' && tile.faction === faction && faction === structureFaction;
}

/**
 * Helper function to see if structure ID is on the matchState actor map
 */
function hasStructure(faction: Faction, id: number, matchState: MatchState): boolean {
  if (faction === 'attacker') return !!matchState.actors.crypts[id];
  else return !!matchState.actors.towers[id];
}
