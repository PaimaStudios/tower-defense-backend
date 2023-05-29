import { baseConfig } from './config';
import type { MatchConfig, MatchState, TileNumber } from '@tower-defense/utils';
import Prando from 'paima-engine/paima-prando';
import { generateRandomMoves } from './ai';
import { generateMatchState } from './map-processor';
import { validateMoves } from './validation';

export const testmap: TileNumber[] = [
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 5, 5, 5, 1, 5, 5, 5, 1, 5, 5,
  5, 1, 2, 6, 6, 6, 2, 6, 6, 6, 2, 1, 5, 1, 5, 1, 5, 1, 5, 1, 5, 1, 5, 1, 2, 6, 2, 6, 2, 6, 2, 6, 2,
  1, 5, 1, 5, 5, 5, 1, 5, 5, 5, 1, 5, 5, 6, 6, 2, 6, 6, 6, 2, 6, 2, 1, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  1, 1, 2, 2, 2, 2, 2, 2, 2, 6, 2, 1, 5, 1, 1, 1, 1, 1, 5, 5, 5, 1, 1, 1, 2, 6, 6, 6, 2, 2, 2, 6, 2,
  3, 5, 5, 5, 5, 1, 1, 5, 1, 5, 5, 5, 1, 2, 6, 2, 6, 2, 6, 6, 6, 4, 1, 5, 1, 1, 5, 1, 5, 5, 1, 1, 1,
  5, 1, 2, 6, 2, 6, 6, 6, 2, 6, 2, 1, 5, 1, 1, 5, 5, 5, 1, 1, 1, 1, 5, 5, 6, 6, 2, 2, 2, 2, 2, 6, 2,
  1, 5, 1, 1, 1, 1, 1, 1, 5, 5, 5, 1, 1, 2, 2, 2, 6, 6, 6, 2, 6, 2, 1, 5, 1, 5, 5, 5, 5, 1, 5, 1, 5,
  1, 1, 2, 6, 6, 6, 2, 6, 2, 6, 2, 1, 5, 5, 5, 1, 1, 5, 5, 5, 1, 5, 5, 5, 6, 6, 2, 2, 2, 6, 6, 6, 2,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2,
];

function getMatchState(config: MatchConfig): MatchState {
  return generateMatchState(
    'defender',
    '0xdDA309096477b89D7066948b31aB05924981DF2B',
    '0xcede5F9E2F8eDa3B6520779427AF0d052B106B57',
    'fork',
    testmap.join(''),
    config,
    new Prando(1)
  );
}
describe('AI', () => {
  test('builds valid structures', () => {
    const maxDefenderStructures = testmap.filter(tile => tile === 1).length;
    const maxAttackerStructures = testmap.filter(tile => tile === 2).length;
    // enough to cover the whole map
    const testGold = 5000;
    const matchState = getMatchState({
      ...baseConfig,
      baseAttackerGoldRate: testGold,
      baseDefenderGoldRate: testGold,
    });
    const attackerMoves = generateRandomMoves(baseConfig, matchState, 'attacker', 1);
    expect(attackerMoves.length).toBe(maxAttackerStructures);
    expect(validateMoves(attackerMoves, 'attacker', matchState)).toBe(true);

    const defenderMoves = generateRandomMoves(baseConfig, matchState, 'defender', 1);
    expect(defenderMoves.length).toBe(maxDefenderStructures);
    expect(validateMoves(defenderMoves, 'defender', matchState)).toBe(true);
  });
});
