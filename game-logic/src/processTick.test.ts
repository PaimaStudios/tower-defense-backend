import { getSurroundingCells } from './processTick';

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
  });
  test('surrounding cells', () => {
    const surroundingCells = getSurroundingCells(22, 10, 10, 2);
    expect(surroundingCells.length).toBe(12);
    [2, 11, 12, 13, 20, 21, 23, 24, 31, 32, 33, 42].forEach(point =>
      expect(surroundingCells).toContain(point)
    );
  });
});
