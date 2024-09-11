import Prando from '@paima/prando';
import { baseConfig } from './config';
import { generateMatchState } from './map-processor';
import { calculatePath, coordsToIndex, getSurroundingCells } from './utils';

const backwards =
  '1111111111111222222222\\r\\n1555551155551266666662\\r\\n1511151151151262222262\\r\\n1511155551151266662262\\r\\n1511111111151222262262\\r\\n1511155551155666662292\\r\\n3555151151111222222264\\r\\n1515151155555226666662\\r\\n1515551111115666222292\\r\\n1511111555511222266662\\r\\n1511111511511222262222\\r\\n1555555511555666662222\\r\\n1111111111111222222222';

describe('Map functions', () => {
  test('path is found when spawning on blocked path', () => {
    const { pathMap, ...matchState } = generateMatchState(
      'defender',
      '0xdDA309096477b89D7066948b31aB05924981DF2B',
      '0xcede5F9E2F8eDa3B6520779427AF0d052B106B57',
      'fork',
      backwards,
      baseConfig,
      new Prando(1)
    );
    const precomputedPath = [
      174, 152, 130, 129, 128, 127, 126, 125, 103, 102, 101, 100, 122, 121, 120, 119, 118, 140, 162,
      161, 160, 159, 137, 115, 93, 92, 91, 113, 135, 134, 133, 132,
    ];
    const width = pathMap[0].length;
    const startPoint = coordsToIndex({ x: 20, y: 7 }, width);
    const destination = matchState.defenderBase.coordinates;
    const path = calculatePath(startPoint, destination, pathMap);
    expect(path).toEqual(precomputedPath);
    // const backwardsMap = [
    //    0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21
    //   [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],12
    //   [1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1],11
    //   [1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1],10
    //   [1, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 1],9
    //   [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1],8
    //   [1, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1],7
    //   [0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],6
    //   [1, 0, 1, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1],5
    //   [1, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1],4
    //   [1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1],3
    //   [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1],2
    //   [1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1],1
    //   [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],0
    // ];
  });
});

describe('Map utilities find', () => {
  test('surrounding cells in corner', () => {
    const surroundingCells = getSurroundingCells(0, 10, 10, 1);
    expect(surroundingCells.length).toBe(2);
    expect(surroundingCells).toContain(1);
    expect(surroundingCells).toContain(10);
  });
  test('surrounding cells near border', () => {
    const surroundingCells = getSurroundingCells(1, 10, 10, 1);
    expect(surroundingCells.length).toBe(3);
    expect(surroundingCells).toContain(0);
    expect(surroundingCells).toContain(2);
    expect(surroundingCells).toContain(11);
  });
  test('surrounding cells', () => {
    const surroundingCells = getSurroundingCells(11, 10, 10, 1);
    expect(surroundingCells.length).toBe(4);
    expect(surroundingCells).toContain(10);
    expect(surroundingCells).toContain(12);
    expect(surroundingCells).toContain(1);
    expect(surroundingCells).toContain(21);

    const biggerRange = getSurroundingCells(22, 10, 10, 2);
    expect(biggerRange.length).toBe(12);
    [2, 11, 12, 13, 20, 21, 23, 24, 31, 32, 33, 42].forEach(point =>
      expect(biggerRange).toContain(point)
    );
  });
});
