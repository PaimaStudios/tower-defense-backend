// import parse from './parser';
import parse from "./parser";

describe('Input parsing', () => {
  test('parses createLobby', () => {
    const normalLobby = parse('c|abcabcdef|d|3|20|F|jungle|T');
    expect(normalLobby.input).toBe('createdLobby');

    // const hiddenLobby = parse('c|3|3|20|100|T|backwards|piranha|');
    // expect(hiddenLobby.input).toBe('createdLobby');

    // const practiceLobby = parse('c|3|3|20|100||crossing|piranha|T');
    // expect(practiceLobby.input).toBe('createdLobby');
  });

  test('parses joinLobby', () => {
    const parsed = parse('j|*Xs6Q9GAqZVwe');
    expect(parsed.input).toBe('joinedLobby');
  });

  test('parses closeLobby', () => {
    let parsed = parse('cs|*Xs6Q9GAqZVwe');
    expect(parsed.input).toBe('closedLobby');
  });

  test('parses submittedTurn', () => {
    const parsed = parse('s|*Xs6Q9GAqZVwe|5|u,3|r,6|s,2|b,1,at|');
    // const parsed = parse('s|*Xs6Q9GAqZVwe|5|u,3|');
    expect(parsed.input).toBe('submittedTurn');
  });

  test('parses setNFT', () => {
    const parsed = parse('n|0xc02aeafdca98755a2bfbcdf5f68364aacef67d3c|324');
    expect(parsed.input).toBe('setNFT');
  });

  test('parses scheduled data', () => {
    const zombie = parse('z|*Xs6Q9GAqZVwe');
    expect(zombie.input).toBe('scheduledData');
    if (zombie.input === 'scheduledData') {
      expect(zombie.effect.type).toBe('zombie');
    }

    const stats = parse('u|*0xc02aeafdca98755a2bfbcdf5f68364aacef67d3c|w');
    expect(stats.input).toBe('scheduledData');
    if (stats.input === 'scheduledData') {
      expect(stats.effect.type).toBe('stats');
    }
  });
});
