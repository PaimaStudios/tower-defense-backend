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
    // right
    const goodConfigs = [
      parse(
        'r|1|gs10;bh100;gd150;ga150;rv25;rc10;ra20;hb5;sb10;at;1;p50;h20;c21;d10;r2;2;p30;h30;c25;d15;r2;3;p40;h40;c28;d20;r3;pt;1;p50;h50;c12;d2;r4;2;p30;h75;c12;d2;r4;3;p40;h100;c19;d2;r4;st;1;p50;h100;c34;d6;r2;2;p30;h150;c31;d8;r2;3;p40;h200;c31;d10;r2;gc;1;p70;h20;r20;c10;d1;br3;bc1;s4;2;p40;h40;r9;c15;d1;br3;bc1;s5;3;p50;h40;r9;c17;d1;br3;bc1;s5;jc;1;p70;h1;r10;c8;d1;br3;bc1;s25;2;p40;h2;r10;c10;d1;br1;bc1;s40;3;p50;h2;r10;c13;d1;br2;bc30;s40;mc;1;p70;h6;r15;c7;d1;br1;bc5;s10;ac60;ar1;2;p40;h10;r15;c9;d3;br3;bc1;s11;ac40;ar2;3;p50;h10;r10;c11;d3;br3;bc30;s11;ac40;ar2'
      ),
      parse(
        'r|1|gs3;bh132;gd172;ga284;rv33;rc117;ra93;hb7;sb9;at;1;p54;h88;c18;d3;r6;2;p3;h75;c29;d20;r5;3;p29;h60;c11;d17;r5;pt;1;p59;h91;c14;d20;r5;2;p86;h98;c29;d9;r6;3;p48;h73;c15;d5;r4;st;1;p16;h59;c16;d10;r5;2;p63;h14;c16;d9;r2;3;p38;h69;c23;d15;r6;gc;1;p62;h27;r3;c11;d9;br2;bc12;s47;2;p14;h61;r14;c2;d10;br5;bc16;s38;3;p93;h85;r5;c11;d4;br3;bc2;s16;jc;1;p96;h70;r7;c15;d3;br3;bc2;s16;2;p29;h48;r5;c17;d2;br5;bc6;s43;3;p81;h61;r13;c14;d2;br5;bc7;s41;mc;1;p18;h76;r10;c19;d10;br3;bc19;s21;ac4;ar2;2;p98;h35;r14;c20;d9;br5;bc6;s32;ac29;ar5;3;p98;h75;r18;c8;d9;br2;bc13;s29;ac6;ar4'
      ),
      parse(
        'r|1|gs6;bh579;gd941;ga366;rv10;rc103;ra169;hb3;sb10;at;1;p49;h17;c13;d16;r4;2;p52;h39;c26;d20;r5;3;p81;h22;c9;d2;r6;pt;1;p31;h73;c15;d12;r2;2;p47;h87;c8;d17;r2;3;p34;h10;c14;d12;r5;st;1;p80;h60;c14;d17;r6;2;p19;h49;c8;d16;r4;3;p7;h27;c27;d14;r3;gc;1;p99;h37;r10;c9;d10;br4;bc6;s23;2;p83;h82;r6;c16;d10;br3;bc17;s36;3;p17;h77;r19;c12;d9;br5;bc10;s45;jc;1;p78;h45;r18;c5;d9;br3;bc3;s9;2;p96;h33;r9;c20;d8;br5;bc5;s21;3;p52;h39;r20;c19;d5;br4;bc9;s18;mc;1;p87;h12;r9;c19;d5;br4;bc19;s32;ac14;ar2;2;p13;h76;r18;c13;d3;br2;bc13;s14;ac13;ar2;3;p83;h37;r14;c3;d6;br2;bc10;s12;ac12;ar3'
      ),
      parse(
        'r|1|gs5;bh385;gd620;ga178;rv16;rc34;ra175;hb6;sb9;at;1;p20;h62;c5;d5;r3;2;p46;h90;c13;d12;r4;3;p64;h6;c15;d12;r4;pt;1;p47;h2;c25;d11;r6;2;p13;h16;c6;d8;r5;3;p26;h59;c6;d6;r4;st;1;p21;h18;c14;d7;r2;2;p35;h43;c11;d3;r6;3;p89;h53;c15;d12;r5;gc;1;p90;h20;r10;c18;d10;br4;bc4;s9;2;p92;h68;r9;c11;d10;br3;bc3;s33;3;p93;h69;r19;c7;d4;br3;bc5;s29;jc;1;p34;h89;r8;c15;d8;br5;bc20;s17;2;p99;h36;r13;c3;d8;br2;bc17;s4;3;p61;h32;r17;c10;d2;br3;bc5;s23;mc;1;p45;h8;r9;c7;d7;br3;bc7;s43;ac12;ar4;2;p34;h62;r15;c18;d10;br2;bc17;s50;ac31;ar3;3;p94;h41;r9;c11;d4;br2;bc13;s43;ac21;ar3'
      ),
      parse(
        'r|1|gs9;bh856;gd719;ga539;rv31;rc63;ra200;hb2;sb9;at;1;p100;h50;c30;d18;r5;2;p99;h51;c12;d8;r5;3;p32;h35;c24;d6;r6;pt;1;p97;h51;c16;d7;r2;2;p40;h66;c9;d11;r6;3;p71;h85;c27;d16;r2;st;1;p68;h89;c7;d5;r5;2;p84;h32;c31;d5;r3;3;p12;h78;c14;d14;r6;gc;1;p31;h61;r10;c15;d7;br4;bc11;s40;2;p60;h36;r12;c2;d8;br2;bc15;s13;3;p60;h62;r17;c3;d5;br2;bc3;s29;jc;1;p52;h3;r5;c12;d3;br5;bc19;s40;2;p99;h45;r6;c10;d3;br3;bc4;s30;3;p56;h67;r7;c2;d4;br3;bc13;s33;mc;1;p39;h62;r20;c16;d10;br2;bc11;s5;ac25;ar4;2;p29;h42;r3;c15;d7;br5;bc3;s38;ac29;ar5;3;p52;h82;r14;c8;d8;br5;bc18;s24;ac19;ar3'
      ),
    ];
    const badConfigs = [
      // wrong
      parse(
        'r|1|gs10;bh100;gd150;ga150;rv25;rc10;ra20;hb5;sbl10;at;1;p50;h20;c21;d10;r2;2;p30;h30;c25;d15;r2;3;p40;h40;c28;d20;r3;pt;1;p50;h50;c12;d2;r4;2;p30;h75;c12;d2;r4;3;p40;h100;c19;d2;r4;st;1;p50;h100;c34;d6;r2;2;p30;h15;c31;d8;r2;3;p40;h50;c31;d10;r2;gc;1;p70;h20;r20;c10;d1;br3;bc1;s4;2;p40;h40;r9;c15;d1;br3;bc1;s5;3;p50;h40;r9;c17;d1;br3;bc1;s5;jc;1;p70;h1;r10;c8;d1;br3;bc1;s25;2;p40;h2;r10;c10;d1;br1;bc1;s40;3;p50;h2;r10;c13;d1;br2;bc18;s40;mc;1;p70;h6;r15;c7;d1;br1;bc5;s10;ac60;2;p40;h10;r15;c9;d3;br3;bc1;s11;ac40;3;p50;h10;r10;c11;d3;br3;bc30;s11;ac40'
      ),
      parse(
        'r|1|gs10;bh100;gd150;ga150;rv25;rc10;ra20;hb5;sb10;at1;p50;h20;c21;d10;r2;2;p30;h30;c25;d15;r2;3;p40;h40;c28;d20;r3;pt;1;p50;h50;c12;d2;r4;2;p30;h75;c12;d2;r4;3;p40;h100;c19;d2;r4;st;1;p50;h100;c34;d6;r2;2;p30;h15;c31;d8;r2;3;p40;h50;c31;d10;r2;gc;1;p70;h20;r20;c10;d1;br3;bc1;s4;2;p40;h40;r9;c15;d1;br3;bc1;s5;3;p50;h40;r9;c17;d1;br3;bc1;s5;jc;1;p70;h1;r10;c8;d1;br3;bc1;s25;2;p40;h2;r10;c10;d1;br1;bc1;s40;3;p50;h2;r10;c13;d1;br2;bc18;s40;mc;1;p70;h6;r15;c7;d1;br1;bc5;s10;ac60;2;p40;h10;r15;c9;d3;br3;bc1;s11;ac40;3;p50;h10;r10;c11;d3;br3;bc30;s11;ac40'
      ),
      parse(
        'r|1|gs10000;bh100;gd150;ga150;rv25;rc10;ra20;hb5;sb10;at;1;p50;h20;c21;d10;r2;2;p30;h30;c25;d15;r2;3;p40;h40;c28;d20;r3;pt;1;p50;h50;c12;d2;r4;2;p30;h75;c12;d2;r4;3;p40;h100;c19;d2;r4;st;1;p50;h100;c34;d6;r2;2;p30;h15;c31;d8;r2;3;p40;h50;c31;d10;r2;gc;1;p70;h20;r20;c10;d1;br3;bc1;s4;2;p40;h40;r9;c15;d1;br3;bc1;s5;3;p50;h40;r9;c17;d1;br3;bc1;s5;jc;1;p70;h1;r10;c8;d1;br3;bc1;s25;2;p40;h2;r10;c10;d1;br1;bc1;s40;3;p50;h2;r10;c13;d1;br2;bc18;s40;mc;1;p70;h6;r15;c7;d1;br1;bc5;s10;ac60;2;p40;h10;r15;c9;d3;br3;bc1;s11;ac40;3;p50;h10;r10;c11;d3;br3;bc30;s11;ac40'
      ),
      parse(
        'r|1|gs10;ph100;gd150;ga150;rv25;rc10;ra20;hb5;sb10;at;1;p50;h20;c21;d10;r2;2;p30;h30;c25;d15;r2;3;p40;h40;c28;d20;r3;pt;1;p50;h50;c12;d2;r4;2;p30;h75;c12;d2;r4;3;p40;h100;c19;d2;r4;st;1;p50;h100;c34;d6;r2;2;p30;h15;c31;d8;r2;3;p40;h50;c31;d10;r2;gc;1;p70;h20;r20;c10;d1;br3;bc1;s4;2;p40;h40;r9;c15;d1;br3;bc1;s5;3;p50;h40;r9;c17;d1;br3;bc1;s5;jc;1;p70;h1;r10;c8;d1;br3;bc1;s25;2;p40;h2;r10;c10;d1;br1;bc1;s40;3;p50;h2;r10;c13;d1;br2;bc18;s40;mc;1;p70;h6;r15;c7;d1;br1;bc5;s10;ac60;2;p40;h10;r15;c9;d3;br3;bc1;s11;ac40;3;p50;h10;r10;c11;d3;br3;bc30;s11;ac40'
      ),
      parse(
        'r|1|gss10;bh100;gd150;ga150;rv25;rc10;ra20;hb5;sb10;at;1;p50;h20;c21;d10;r2;2;p30;h30;c25;d15;r2;3;p40;h40;c28;d20;r3;pt;1;p50;h50;c12;d2;r4;2;p30;h75;c12;d2;r4;3;p40;h100;c19;d2;r4;st;1;p50;h100;c34;d6;r2;2;p30;h15;c31;d8;r2;3;p40;h50;c31;d10;r2;gc;1;p70;h20;r20;c10;d1;br3;bc1;s4;2;p40;h40;r9;c15;d1;br3;bc1;s5;3;p50;h40;r9;c17;d1;br3;bc1;s5;jc;1;p70;h1;r10;c8;d1;br3;bc1;s25;2;p40;h2;r10;c10;d1;br1;bc1;s40;3;p50;h2;r10;c13;d1;br2;bc18;s40;mc;1;p70;h6;r15;c7;d1;br1;bc5;s10;ac60;2;p40;h10;r15;c9;d3;br3;bc1;s11;ac40;3;p50;h10;r10;c11;d3;br3;bc30;s11;ac40'
      ),
    ];
    const ok = goodConfigs.reduce((acc, item) => {
      console.log(item.input, 'ok1');
      return item.input === 'registeredConfig' ? acc : false;
    }, true);
    const ok2 = badConfigs.reduce((acc, item) => {
      console.log(item.input, 'ok2');
      return item.input !== 'registeredConfig' ? acc : false;
    }, ok);
    expect(ok2).toBeTruthy();
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
