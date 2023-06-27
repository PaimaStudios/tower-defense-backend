import type { TurnAction, Faction, MatchState, BuildStructureAction } from '@tower-defense/utils';

export function validateMoves(
  actions: TurnAction[],
  faction: Faction,
  matchState: MatchState
): boolean {
  if (hasOverlapingBuilds(actions)) return false;

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
 * WARN: tile.type === 'open' says nothing about whether the tile is occupied
 */
function canBuild(
  faction: Faction,
  { coordinates, structure }: BuildStructureAction,
  matchState: MatchState
): boolean {
  const structureFaction: Faction = structure.includes('rypt') ? 'attacker' : 'defender';
  if (faction !== structureFaction) return false;

  const tile = matchState.map[coordinates];
  const isSuitable = tile.type === 'open' && tile.faction === faction;
  if (!isSuitable) return false;

  const actors = faction === 'attacker' ? matchState.actors.crypts : matchState.actors.towers;
  const isOccupied = Object.values(actors).some(actor => actor.coordinates === coordinates);
  return !isOccupied;
}

/**
 * Helper function to see if structure ID is on the matchState actor map
 */
function hasStructure(faction: Faction, id: number, matchState: MatchState): boolean {
  if (faction === 'attacker') return !!matchState.actors.crypts[id];
  else return !!matchState.actors.towers[id];
}

function isBuildAction(action: TurnAction): action is BuildStructureAction {
  return action.action === 'build';
}
/**
 * Checks whether all of the build coordinates are unique
 */
function hasOverlapingBuilds(actions: TurnAction[]): boolean {
  const coordinates: number[] = actions.filter(isBuildAction).map(action => action.coordinates);
  if (coordinates.length === 0) return false;

  return new Set(coordinates).size !== coordinates.length;
}
