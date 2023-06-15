import PaimaSM from 'paima-engine/paima-sm';
import { creds } from '@tower-defense/db';
import gameStateTransitionV1 from './stf/v1';
import { GameENV } from '@tower-defense/utils';
import type { GameStateTransitionFunction } from 'paima-engine/paima-runtime';

function gameStateTransitionRouter(blockHeight: number): GameStateTransitionFunction {
  if (blockHeight >= 0) return gameStateTransitionV1;
  else return gameStateTransitionV1;
}

const gameSM = PaimaSM.initialize(creds, 4, gameStateTransitionRouter, GameENV.START_BLOCKHEIGHT);

export default gameSM;
