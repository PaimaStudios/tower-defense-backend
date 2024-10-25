import Prando from '@paima/prando';
import { baseConfig } from './config';
import { generateMatchState } from './map-processor';
import { validateMoves } from './validation';
import type {
  BuildStructureAction,
  Faction,
  StructureType,
  TurnAction,
  UpgradeStructureAction,
} from '@tower-defense/utils';

const lineMap =
  '1111111111111222222222\\r\\n1111111111111222222222\\r\\n1111111111111222222222\\r\\n1111111111111222222222\\r\\n1111111111111222222222\\r\\n1111111111111222222222\\r\\n3555555555555666666664\\r\\n1111111111111222222222\\r\\n1111111111111222222222\\r\\n1111111111111222222222\\r\\n1111111111111222222222\\r\\n1111111111111222222222\\r\\n1111111111111222222222';

describe('Validation', () => {
  const buildAction = (
    faction: Faction,
    structure: StructureType,
    coordinates: number
  ): BuildStructureAction => ({ action: 'build', structure, coordinates, faction, round: 1 });

  test('can build only on open tiles with matching faction', () => {
    const factions: Faction[] = ['attacker', 'defender'];
    // picked a square in the middle of the map lines 6&7 with all 4 tile options
    const defenderOpenTile = 166;
    const attackerOpenTile = 167;
    const defenderPathTile = 144;
    const attackerPathTile = 145;

    const matchState = generateMatchState(
      'defender',
      'p1',
      1,
      'p2',
      2,
      'line',
      lineMap,
      baseConfig,
      new Prando(1)
    );

    const validMoves: Record<Faction, TurnAction[][]> = {
      attacker: [[], [buildAction('attacker', 'gorillaCrypt', attackerOpenTile)]],
      defender: [[], [buildAction('defender', 'anacondaTower', defenderOpenTile)]],
    };

    factions.map(faction => {
      validMoves[faction].forEach(moves => {
        const result = validateMoves(moves, faction, matchState);
        expect(result).toBe(true);
      });
    });

    const invalidMoves: Record<Faction, TurnAction[][]> = {
      attacker: [
        [buildAction('attacker', 'gorillaCrypt', attackerPathTile)],
        [buildAction('attacker', 'gorillaCrypt', defenderOpenTile)],
        [buildAction('attacker', 'gorillaCrypt', defenderPathTile)],
        [buildAction('attacker', 'slothTower', attackerOpenTile)],
      ],
      defender: [
        [buildAction('defender', 'slothTower', defenderPathTile)],
        [buildAction('defender', 'slothTower', attackerOpenTile)],
        [buildAction('defender', 'slothTower', attackerPathTile)],
        [buildAction('defender', 'gorillaCrypt', defenderOpenTile)],
      ],
    };
    factions.map(faction => {
      invalidMoves[faction].forEach(moves => {
        const result = validateMoves(moves, faction, matchState);
        expect(result).toBe(false);
      });
    });
  });

  test("can't build multiple structures on 1 tile", () => {
    const defenderOpenTile = 166;
    const attackerOpenTile = 167;

    const matchState = generateMatchState(
      'defender',
      'p1',
      1,
      'p2',
      2,
      'line',
      lineMap,
      baseConfig,
      new Prando(1)
    );
    const attackerActions = [
      buildAction('attacker', 'macawCrypt', attackerOpenTile),
      buildAction('attacker', 'gorillaCrypt', attackerOpenTile),
    ];
    expect(validateMoves(attackerActions, 'attacker', matchState)).toBe(false);

    const defenderActions = [
      buildAction('defender', 'slothTower', defenderOpenTile),
      buildAction('defender', 'slothTower', defenderOpenTile),
    ];
    expect(validateMoves(defenderActions, 'defender', matchState)).toBe(false);
  });

  test('can modify existing structures only', () => {
    const defenderOpenTile = 166;
    const attackerOpenTile = 167;

    const matchState = generateMatchState(
      'defender',
      'p1',
      1,
      'p2',
      2,
      'line',
      lineMap,
      baseConfig,
      new Prando(1)
    );
    const upgradeAttacker: UpgradeStructureAction = {
      action: 'upgrade',
      id: 1,
      round: 1,
      faction: 'attacker',
    };
    expect(validateMoves([upgradeAttacker], 'attacker', matchState)).toBe(false);
    matchState.actors.crypts[1] = {
      type: 'structure',
      id: 1,
      faction: 'attacker',
      structure: 'gorillaCrypt',
      upgrades: 1,
      coordinates: attackerOpenTile,
      builtOnRound: 1,
      spawned: [],
    };
    expect(validateMoves([upgradeAttacker], 'attacker', matchState)).toBe(true);

    const upgradeDefender: UpgradeStructureAction = {
      action: 'upgrade',
      id: 1,
      round: 1,
      faction: 'defender',
    };
    expect(validateMoves([upgradeDefender], 'defender', matchState)).toBe(false);
    matchState.actors.towers[1] = {
      type: 'structure',
      id: 1,
      faction: 'defender',
      structure: 'anacondaTower',
      upgrades: 1,
      coordinates: defenderOpenTile,
      health: 100,
      lastShot: 0,
    };
    expect(validateMoves([upgradeDefender], 'defender', matchState)).toBe(true);
  });
});
