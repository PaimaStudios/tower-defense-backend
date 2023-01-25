import PaimaSM from 'paima-engine/paima-sm';
import { creds } from '@tower-defense/db';
import gameStateTransitionV1 from './stf/v1/transition.js';
import { START_BLOCKHEIGHT } from '@tower-defense/utils';

function gameStateTransitionRouter(blockHeight: number) {
  if (blockHeight >= 0) return gameStateTransitionV1;
  else return gameStateTransitionV1;
}

const gameSM = PaimaSM.initialize(creds, 4, gameStateTransitionRouter, START_BLOCKHEIGHT);

export default gameSM;
