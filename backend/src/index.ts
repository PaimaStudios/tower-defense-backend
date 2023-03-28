import paimaFunnel from 'paima-engine/paima-funnel';
import paimaRuntime from 'paima-engine/paima-runtime';
import gameSM from './sm.js';
import registerEndpoints from '@tower-defense/api';
import {
  STOP_BLOCKHEIGHT,
  STORAGE_ADDRESS,
  CHAIN_URI,
  gameBackendVersion,
  SERVER_ONLY_MODE,
} from '@tower-defense/utils';
import { setPool } from '@tower-defense/db';
const POLLING_RATE = 1;

async function main() {
  console.log(STORAGE_ADDRESS, 'storage address');
  const chainFunnel = await paimaFunnel.initialize(CHAIN_URI, STORAGE_ADDRESS);
  setPool(gameSM.getReadonlyDbConn());
  const engine = paimaRuntime.initialize(chainFunnel, gameSM, gameBackendVersion);
  engine.setPollingRate(POLLING_RATE);
  engine.addEndpoints(registerEndpoints);
  engine.run(STOP_BLOCKHEIGHT, SERVER_ONLY_MODE);
}

main();
