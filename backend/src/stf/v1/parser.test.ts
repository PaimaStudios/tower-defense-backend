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
  test('parses registerConfig', () => {
    const parsed = parse('r|1|gs10;bh100;gd150;ga150;rv25;rc10;ra20;hb5;sb10;at;1;p50;h20;c21;d10;r2;2;p30;h30;c25;d15;r2;3;p40;h40;c28;d20;r3;pt;1;p50;h50;c12;d2;r4;2;p30;h75;c12;d2;r4;3;p40;h100;c19;d2;r4;st;1;p50;h100;c34;d6;r2;2;p30;h150;c31;d8;r2;3;p40;h200;c31;d10;r2;gc;1;p70;h20;r20;c10;d1;br3;bc1;s4;2;p40;h40;r9;c15;d1;br3;bc1;s5;3;p50;h40;r9;c17;d1;br3;bc1;s5;jc;1;p70;h1;r10;c8;d1;br3;bc1;s25;2;p40;h2;r10;c10;d1;br1;bc1;s40;3;p50;h2;r10;c13;d1;br2;bc30;s40;mc;1;p70;h6;r15;c7;d1;br1;bc5;s10;ac60;2;p40;h10;r15;c9;d3;br3;bc1;s11;ac40;3;p50;h10;r10;c11;d3;br3;bc30;s11;ac40');
    expect(parsed.input).toBe('registeredConfig');
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
