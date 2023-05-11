import type { TurnAction, Faction, MatchState, Structure, Tile } from '@tower-defense/utils';

export function validateMoves(
  actions: TurnAction[],
  faction: Faction,
  matchState: MatchState
): boolean {
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
  const structureFaction = structure.includes('rypt') ? 'attacker' : 'defender';
  const myTile = matchState.map[coords];
  const isTileAvailable = (tile: Tile) =>
    tile.type === 'open' && tile.faction === faction && faction === structureFaction;
  //TODO: remove this extra logic once logging of such depth is not needed
  if (!isTileAvailable(myTile)) {
    const availableTiles = matchState.map.reduce(
      (acc: number[], tile, index) => (isTileAvailable(tile) ? [...acc, index] : acc),
      []
    );
  }
  return isTileAvailable(myTile);
}
// Helper function to see if structure ID is on the matchState actor map
function hasStructure(faction: Faction, id: number, matchState: MatchState): boolean {
  if (faction === 'attacker') return !!matchState.actors.crypts[id];
  else return !!matchState.actors.towers[id];
}
