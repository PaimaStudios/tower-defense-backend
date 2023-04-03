import parse from './parser';
import type { UserStats, ZombieRound } from './types';

describe('Input parsing', () => {
  test('parses createLobby', () => {
    const normalLobby = parse('c|defaultdefault|r|100|100|F|jungle|F');
    expect(normalLobby.input).toBe('createdLobby');

    const hiddenLobby = parse('c|defaultdefault|a|100|500|T|backwards|F');
    expect(hiddenLobby.input).toBe('createdLobby');

    const practiceLobby = parse('c|defaultdefault|d|100|1000|F|crossing|T');
    expect(practiceLobby.input).toBe('createdLobby');
  });

  test('parses joinLobby', () => {
    const parsed = parse('j|*Xs6Q9GAqZVwe');
    expect(parsed.input).toBe('joinedLobby');
  });

  test('parses closeLobby', () => {
    const parsed = parse('cs|*Xs6Q9GAqZVwe');
    expect(parsed.input).toBe('closedLobby');
  });

  test('parses submitMoves', () => {
    //a few move possibilities
    const moves = [
      's|*Xs6Q9GAqZVwe|2',
      's|*Xs6Q9GAqZVwe|2|r4',
      's|*Xs6Q9GAqZVwe|2|u5',
      's|*Xs6Q9GAqZVwe|2|s15',
      's|*Xs6Q9GAqZVwe|2|r4|u5',
      's|*Xs6Q9GAqZVwe|2|r4|u5|s15',
      's|*Xs6Q9GAqZVwe|2|r4|r5|r6',
      's|*Xs6Q9GAqZVwe|2|b5,at',
      's|*Xs6Q9GAqZVwe|2|b5,at|b6,pt|b7,st',
      's|*Xs6Q9GAqZVwe|2|b5,gc|b6,jc|b7,mc',
    ];
    moves.forEach(move => {
      const parsed = parse(move);
      expect(parsed.input).toBe('submittedTurn');
    });
  });

  test('parses scheduled data', () => {
    const zombie = parse('z|*Xs6Q9GAqZVwe');
    expect(zombie.input).toBe('scheduledData');
    expect((zombie as ZombieRound).effect).toBe('zombie');

    const stats = parse('u|*0xc02aeafdca98755a2bfbcdf5f68364aacef67d3c|w');
    expect(stats.input).toBe('scheduledData');
    expect((stats as UserStats).effect).toBe('stats');
  });
});
