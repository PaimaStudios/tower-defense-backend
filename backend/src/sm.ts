import gameStateTransitionV1 from './stf/v1';
import gameStateTransitionV2 from './stf/v2';
import { GameENV } from '@tower-defense/utils';

function gameStateTransitionRouter(blockHeight: number) {
  if (blockHeight >= 0 && blockHeight < GameENV.LOBBY_AUTOPLAY_BLOCKHEIGHT) {
    return gameStateTransitionV1;
  }
  if (blockHeight >= GameENV.LOBBY_AUTOPLAY_BLOCKHEIGHT) {
    return gameStateTransitionV2;
  }
  return gameStateTransitionV1;
}

export default gameStateTransitionRouter;
