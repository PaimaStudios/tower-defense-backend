
import mockFunnel from './mock-funnel.js';
import gameSM from './sm.js';
import {
  STOP_BLOCKHEIGHT,
  STORAGE_ADDRESS,
  CHAIN_URI,
  gameBackendVersion,
  SERVER_ONLY_MODE,
} from '@tower-defense/utils';
import { setPool } from '@tower-defense/db';
import { GameStateMachine } from 'paima-engine/paima-utils';
const mockRuntime = {
  initialize: (chainFunnel: any, sm: GameStateMachine) => {
  return {
    async run(){
      const latestReadBlockHeight = await sm.latestBlockHeight();
      const latestChainDataList = await chainFunnel.readData(latestReadBlockHeight + 1)
      for (let block of latestChainDataList){
        await sm.process(block);
      }
      console.log("seeding complete")
    }
    }
  }
}
async function main() {
  console.log(STORAGE_ADDRESS);
  const chainFunnel = await mockFunnel.initialize(CHAIN_URI, STORAGE_ADDRESS);
  setPool(gameSM.getReadonlyDbConn());
  const engine = mockRuntime.initialize(chainFunnel, gameSM);
  engine.run();
}

main();
