import type { IGetLobbyByIdResult } from '@tower-defense/db';
import type { MatchResults, MatchState, Result } from '@tower-defense/utils';
import processTick from './processTick.js';
export default processTick;
export { generateBotMoves, generateMoves, generateRandomMoves } from './ai.js';
export { baseConfig, conciseFactionMap, parseConfig } from './config.js';
export { generateMatchState, getMap } from './map-processor.js';
export { validateMoves } from './validation.js';

const calculateResult = (isAttacker: boolean, defenderSurvived: boolean): Result => {
  return isAttacker ? (defenderSurvived ? 'loss' : 'win') : defenderSurvived ? 'win' : 'loss';
};

export function matchResults(lobby: IGetLobbyByIdResult, matchState: MatchState): MatchResults {
  const p1isAttacker = matchState.attacker === lobby.lobby_creator;
  const defenderSurvived = matchState.defenderBase.health > 0;
  // Save the final user states in the final state table
  const [p1Gold, p2Gold] = p1isAttacker
    ? [matchState.attackerGold, matchState.defenderGold]
    : [matchState.defenderGold, matchState.attackerGold];

  const p1Result = calculateResult(p1isAttacker, defenderSurvived);
  const p2Result = p1Result === 'win' ? 'loss' : 'win';

  return [
    {
      result: p1Result,
      gold: p1Gold,
      wallet: lobby.lobby_creator,
    },
    {
      result: p2Result,
      gold: p2Gold,
      wallet: lobby.player_two!,
    },
  ];
}
