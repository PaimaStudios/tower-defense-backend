import { baseConfig } from './config';
import type {
  AttackerStructure,
  AttackerStructureType,
  DefenderStructure,
  DefenderStructureType,
  MatchState,
  UpgradeTier,
} from '@tower-defense/utils';
import Prando from '@paima/prando';
import {
  computeStartTiles,
  generateBotMoves,
  generateRandomMoves,
  getMinStructureCost,
} from './ai';
import { generateMatchState } from './map-processor';
import { validateMoves } from './validation';
import processTick from './processTick';
import { getPossibleStructures } from './utils';

const jungleMap =
  '1111111111111222222222\\r\\n1555155515551266626662\\r\\n1515151515151262626262\\r\\n1515551555155662666262\\r\\n1511111111111222222262\\r\\n1511111555111266622262\\r\\n3555511515551262626694\\r\\n1511515511151262666262\\r\\n1511555111155662222262\\r\\n1511111155511222666262\\r\\n1515555151511266626262\\r\\n1555115551555662226662\\r\\n1111111111111222222222';
// 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2,
// 1, 5, 5, 5, 1, 5, 5, 5, 1, 5, 5, 5, 1, 2, 6, 6, 6, 2, 6, 6, 6, 2,
// 1, 5, 1, 5, 1, 5, 1, 5, 1, 5, 1, 5, 1, 2, 6, 2, 6, 2, 6, 2, 6, 2,
// 1, 5, 1, 5, 5, 5, 1, 5, 5, 5, 1, 5, 5, 6, 6, 2, 6, 6, 6, 2, 6, 2,
// 1, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 6, 2,
// 1, 5, 1, 1, 1, 1, 1, 5, 5, 5, 1, 1, 1, 2, 6, 6, 6, 2, 2, 2, 6, 2,
// 3, 5, 5, 5, 5, 1, 1, 5, 1, 5, 5, 5, 1, 2, 6, 2, 6, 2, 6, 6, 6, 4,
// 1, 5, 1, 1, 5, 1, 5, 5, 1, 1, 1, 5, 1, 2, 6, 2, 6, 6, 6, 2, 6, 2,
// 1, 5, 1, 1, 5, 5, 5, 1, 1, 1, 1, 5, 5, 6, 6, 2, 2, 2, 2, 2, 6, 2,
// 1, 5, 1, 1, 1, 1, 1, 1, 5, 5, 5, 1, 1, 2, 2, 2, 6, 6, 6, 2, 6, 2,
// 1, 5, 1, 5, 5, 5, 5, 1, 5, 1, 5, 1, 1, 2, 6, 6, 6, 2, 6, 2, 6, 2,
// 1, 5, 5, 5, 1, 1, 5, 5, 5, 1, 5, 5, 5, 6, 6, 2, 2, 2, 6, 6, 6, 2,
// 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2,

const backwards =
  '1111111111111222222222\\r\\n1555551155551266666662\\r\\n1511151151151262222262\\r\\n1511155551151266662262\\r\\n1511111111151222262262\\r\\n1511155551155666662262\\r\\n3555151151111222222264\\r\\n1515151155555226666692\\r\\n1515551111115666222262\\r\\n1511111555511222266662\\r\\n1511111511511222262222\\r\\n1555555511555666662222\\r\\n1111111111111222222222';
const reflection =
  '1111111111111222222222\\r\\n1155511115551222222222\\r\\n1151511115151226662222\\r\\n1551555155155226262222\\r\\n1511115551115666266662\\r\\n1511111111111222222262\\r\\n3511111111111222222294\\r\\n1511111111111222222262\\r\\n1511115551115666266662\\r\\n1551555155155226262222\\r\\n1151511115151226662222\\r\\n1155511115551222222222\\r\\n1111111111111222222222';
const merge =
  '1111111111122222222222\\r\\n1155555555566666666664\\r\\n1151111511122222222222\\r\\n1151111511122222222222\\r\\n1151111511122222222222\\r\\n1151111555566666666664\\r\\n3551111111122222222222\\r\\n1151111555566666666664\\r\\n1151111511122222222222\\r\\n1151111511122222222222\\r\\n1151111511122222222222\\r\\n1155555555566666666664\\r\\n1111111111122222222222';

//TODO: test utils (?)
// const straight =
//   '1111111111111222222222\\r\\n1155511111155662266622\\r\\n1151511555151262262662\\r\\n1551515515151266262262\\r\\n1511555115551226662262\\r\\n1511111111111222222262\\r\\n3555555555555666666694\\r\\n1511111111111222222262\\r\\n1511555115551226662262\\r\\n1551515515151266262262\\r\\n1151511555151262262662\\r\\n1155511111155662266622\\r\\n1111111111111222222222';
// const wavy =
//   '1111111111111222222222\\r\\n1115551115551226662222\\r\\n1555155515151226266662\\r\\n1511111555155666222262\\r\\n1555111111111222222262\\r\\n1515111555111222666262\\r\\n3515155515155662626694\\r\\n1515151115151262622262\\r\\n1515551115551262626662\\r\\n1511111111111266626222\\r\\n1551155551555222226222\\r\\n1155551155515666666222\\r\\n1111111111111222222222';
// const fork =
//   '1111111111111222222222\\r\\n1555555555555666666662\\r\\n1511111111111222222292\\r\\n1555555555555666666662\\r\\n1151111111111222222922\\r\\n1555555555555666666662\\r\\n3511111111111222222294\\r\\n1555555555555666666662\\r\\n1151111111111222222922\\r\\n1555555555555666666662\\r\\n1511111111111222222292\\r\\n1555555555555666666662\\r\\n1111111111111222222222';
// const line =
//   '1111111111111222222222\\r\\n1111111111111222222222\\r\\n1111111111111222222222\\r\\n1111111111111222222222\\r\\n1111111111111222222222\\r\\n1111111111111222222222\\r\\n3555555555555666666664\\r\\n1111111111111222222222\\r\\n1111111111111222222222\\r\\n1111111111111222222222\\r\\n1111111111111222222222\\r\\n1111111111111222222222\\r\\n1111111111111222222222';

function getMatchState(config = baseConfig, map = jungleMap): MatchState {
  return generateMatchState(
    'defender',
    '0xdDA309096477b89D7066948b31aB05924981DF2B',
    1,
    '0xcede5F9E2F8eDa3B6520779427AF0d052B106B57',
    2,
    'fork',
    map,
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
    const prando = new Prando(1);
    // enough to cover the whole map
    const testGold = 6000;
    const matchState = getMatchState({
      ...baseConfig,
      baseAttackerGoldRate: testGold,
      baseDefenderGoldRate: testGold,
    });
    const maxAttackerStructures = matchState.map.filter(
      tile => tile.type === 'open' && tile.faction === 'attacker'
    ).length;
    const maxDefenderStructures = matchState.map.filter(
      tile => tile.type === 'open' && tile.faction === 'defender'
    ).length;

    const attackerMoves = generateRandomMoves(baseConfig, matchState, 'attacker', 1, prando);
    expect(attackerMoves.length).toBe(maxAttackerStructures);
    expect(validateMoves(attackerMoves, 'attacker', matchState)).toBe(true);

    const defenderMoves = generateRandomMoves(baseConfig, matchState, 'defender', 1, prando);
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
    const round1Moves = generateRandomMoves(baseConfig, matchState, 'defender', 1, prando);
    console.log({ crypts: matchState.actors.crypts, towers: matchState.actors.towers });
    expect(validateMoves(round1Moves, 'defender', matchState)).toBe(true);
    processTick(baseConfig, matchState, round1Moves, 1, prando);

    const round2Moves = generateRandomMoves(baseConfig, matchState, 'attacker', 2, prando);
    expect(validateMoves(round2Moves, 'attacker', matchState)).toBe(true);
    processTick(baseConfig, matchState, round2Moves, 1, prando);

    expect(matchState.attackerGold).toBeLessThan(testGold);
    expect(matchState.attackerGold).toBeGreaterThan(0);
    expect(matchState.defenderGold).toBeLessThan(testGold);
    expect(matchState.defenderGold).toBeGreaterThan(0);

    // new random moves should be empty (no more possible structures to build)
    const round3Moves = generateRandomMoves(baseConfig, matchState, 'defender', 3, prando);
    expect(validateMoves(round3Moves, 'defender', matchState)).toBe(true);
    expect(round3Moves.length).toBe(0);
    const round4Moves = generateRandomMoves(baseConfig, matchState, 'attacker', 4, prando);
    expect(validateMoves(round4Moves, 'attacker', matchState)).toBe(true);
    expect(round4Moves.length).toBe(0);
  });

  test('prioritizes upgrades', () => {
    const prando = new Prando(1);
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
    const defenderMoves = generateBotMoves(baseConfig, matchState, 'defender', 1, prando);
    const defenderUpgrades = defenderMoves.filter(move => move.action === 'upgrade').length;
    expect(defenderUpgrades).toBe(maxTierSum - defenderTierSum);

    const attackerTierSum = Object.values(attackerStructures).reduce(
      (acc, structure) => (acc += structure.upgrades),
      0
    );
    const attackerMoves = generateBotMoves(baseConfig, matchState, 'attacker', 1, prando);
    const attackerUpgrades = attackerMoves.filter(move => move.action === 'upgrade').length;
    expect(attackerUpgrades).toBe(maxTierSum - attackerTierSum);
  });

  test('start tiles are computed correctly', () => {
    let matchState = getMatchState(baseConfig, merge);
    let startTiles = computeStartTiles(matchState);
    expect(startTiles.length).toEqual(4);

    matchState = getMatchState(baseConfig, reflection);
    startTiles = computeStartTiles(matchState);
    expect(startTiles.length).toEqual(2);

    matchState = getMatchState(baseConfig, backwards);
    startTiles = computeStartTiles(matchState);
    expect(startTiles.length).toEqual(3);
  });

  test('min structure cost is computed correctly', () => {
    const attackerCost = getMinStructureCost(baseConfig, 'attacker');
    expect(attackerCost).toEqual(70);
    const defenderCost = getMinStructureCost(baseConfig, 'defender');
    expect(defenderCost).toEqual(50);
  });
});
