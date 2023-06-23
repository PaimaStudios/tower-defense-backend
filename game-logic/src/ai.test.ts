import { baseConfig } from './config';
import type {
  AttackerStructure,
  AttackerStructureType,
  DefenderStructure,
  DefenderStructureType,
  MatchConfig,
  MatchState,
  TileNumber,
  UpgradeTier,
} from '@tower-defense/utils';
import Prando from 'paima-engine/paima-prando';
import { generateBotMoves, generateRandomMoves } from './ai';
import { generateMatchState } from './map-processor';
import { validateMoves } from './validation';
import processTick from './processTick';
import { getPossibleStructures } from './utils';

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

const getRandomCrypts = (count: number): Record<number, AttackerStructure> => {
  const types = getPossibleStructures('attacker') as AttackerStructureType[];

  const structures: Record<number, AttackerStructure> = {};
  for (let i = 0; i < count; i++) {
    const attackerStructure: AttackerStructure = {
      type: 'structure',
      faction: 'attacker',
      id: Math.floor(Math.random() * 1000),
      spawned: [],
      structure: types[Math.floor(Math.random() * types.length)],
      upgrades: (Math.floor(Math.random() * 3) + 1) as UpgradeTier,
      coordinates: 0,
      builtOnRound: 1,
    };
    structures[attackerStructure.id] = attackerStructure;
  }
  return structures;
};

const getRandomTowers = (count: number): Record<number, DefenderStructure> => {
  const types = getPossibleStructures('defender') as DefenderStructureType[];

  const structures: Record<number, DefenderStructure> = {};
  for (let i = 0; i < count; i++) {
    const defenderStructure: DefenderStructure = {
      type: 'structure',
      faction: 'defender',
      id: Math.floor(Math.random() * 1000),
      structure: types[Math.floor(Math.random() * types.length)] as DefenderStructureType,
      upgrades: (Math.floor(Math.random() * 3) + 1) as UpgradeTier,
      coordinates: 0,
      health: 100,
      lastShot: 0,
    };
    structures[defenderStructure.id] = defenderStructure;
  }
  return structures;
};

describe('AI', () => {
  test('builds valid structures (round scope)', () => {
    const maxDefenderStructures = testmap.filter(tile => tile === 1).length;
    const maxAttackerStructures = testmap.filter(tile => tile === 2).length;
    // enough to cover the whole map
    const testGold = 6000;
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

  test('builds valid structures (match scope)', () => {
    const prando = new Prando(1);
    // enough to cover the whole map
    const testGold = 6000;
    const matchState = getMatchState({
      ...baseConfig,
      baseAttackerGoldRate: testGold,
      baseDefenderGoldRate: testGold,
    });

    //fill the map with structures
    const round1Moves = generateRandomMoves(baseConfig, matchState, 'defender', 1);
    console.log({ crypts: matchState.actors.crypts, towers: matchState.actors.towers });
    expect(validateMoves(round1Moves, 'defender', matchState)).toBe(true);
    processTick(baseConfig, matchState, round1Moves, 1, prando);

    const round2Moves = generateRandomMoves(baseConfig, matchState, 'attacker', 2);
    expect(validateMoves(round2Moves, 'attacker', matchState)).toBe(true);
    processTick(baseConfig, matchState, round2Moves, 1, prando);

    expect(matchState.attackerGold).toBeLessThan(testGold);
    expect(matchState.attackerGold).toBeGreaterThan(0);
    expect(matchState.defenderGold).toBeLessThan(testGold);
    expect(matchState.defenderGold).toBeGreaterThan(0);

    // new random moves should be empty (no more possible structures to build)
    const round3Moves = generateRandomMoves(baseConfig, matchState, 'defender', 3);
    expect(validateMoves(round3Moves, 'defender', matchState)).toBe(true);
    expect(round3Moves.length).toBe(0);
    const round4Moves = generateRandomMoves(baseConfig, matchState, 'attacker', 4);
    expect(validateMoves(round4Moves, 'attacker', matchState)).toBe(true);
    expect(round4Moves.length).toBe(0);
  });

  test('prioritizes upgrades', () => {
    // enough to upgrade everything
    const testGold = 6000;
    const matchState = getMatchState({
      ...baseConfig,
      baseAttackerGoldRate: testGold,
      baseDefenderGoldRate: testGold,
    });
    const defenderStructures = getRandomTowers(10);
    matchState.actors.towers = defenderStructures;
    const attackerStructures = getRandomCrypts(10);
    matchState.actors.crypts = attackerStructures;

    const maxTierSum = 30;

    const defenderTierSum = Object.values(defenderStructures).reduce(
      (acc, structure) => (acc += structure.upgrades),
      0
    );
    // generated moves should contain upgrades to every structure
    const defenderMoves = generateBotMoves(baseConfig, matchState, 'defender', 1);
    const defenderUpgrades = defenderMoves.filter(move => move.action === 'upgrade').length;
    expect(defenderUpgrades).toBe(maxTierSum - defenderTierSum);

    const attackerTierSum = Object.values(attackerStructures).reduce(
      (acc, structure) => (acc += structure.upgrades),
      0
    );
    const attackerMoves = generateBotMoves(baseConfig, matchState, 'attacker', 1);
    const attackerUpgrades = attackerMoves.filter(move => move.action === 'upgrade').length;
    expect(attackerUpgrades).toBe(maxTierSum - attackerTierSum);
  });

  // test('calculates path coverage', () => {});
  // test('picks closest X tiles to base with path coverage', () => {});
});
