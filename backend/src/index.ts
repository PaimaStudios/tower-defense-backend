import paimaFunnel from 'paima-engine/paima-funnel';
import paimaRuntime from 'paima-engine/paima-runtime';
import gameSM from './sm.js';
import registerEndpoints from '@tower-defense/api';
import { gameBackendVersion, GameENV } from '@tower-defense/utils';
import { setPool } from '@tower-defense/db';
const POLLING_RATE = 1;

async function main() {
  console.log(GameENV.CONTRACT_ADDRESS, 'storage address');
  const chainFunnel = await paimaFunnel.initialize(GameENV.CHAIN_URI, GameENV.CONTRACT_ADDRESS);
  setPool(gameSM.getReadonlyDbConn());
  const engine = paimaRuntime.initialize(chainFunnel, gameSM, gameBackendVersion);
  engine.setPollingRate(POLLING_RATE);
  engine.addEndpoints(registerEndpoints);
  engine.run(GameENV.STOP_BLOCKHEIGHT, GameENV.SERVER_ONLY_MODE);
}

main();
