import { getAllMaps, testPool } from '@tower-defense/db';
import { getMap } from '@tower-defense/game-logic';
import type { PathTile, RawMap, Tile, TileNumber } from '@tower-defense/utils';
test('all paths lead to other paths', async () => {
  const maps = await getAllMaps.run(undefined, testPool);
  const ok = maps.reduce((acc, mp) => {
    const rows = mp.layout.split('\\r\\n');
    const rawMap: RawMap = {
      name: mp.name,
      width: rows[0].length,
      height: rows.length,
      contents: rows
        .join('')
        .split('')
        .map(s => parseInt(s) as TileNumber),
    };
    const fullMap = getMap(rawMap);
    const paths: PathTile[] = fullMap.mapState.filter(
      (t: Tile): t is PathTile => t.type === 'path'
    );
    const allArePaths = paths.reduce((acc, item) => {
      if (item.leadsTo.length < 1) return false;
      else {
        const ok = item.leadsTo.reduce((acc, i) => {
          if (fullMap.mapState[i].type === 'path') return acc;
          else if (
            fullMap.mapState[i].type === 'base' &&
            fullMap.mapState[i].faction === 'defender'
          )
            return acc;
          else return false;
        }, true);
        return ok ? acc : false;
      }
    }, true);
    if (allArePaths) return acc;
    else return false;
  }, true);
  expect(ok).toBeTruthy();
});
