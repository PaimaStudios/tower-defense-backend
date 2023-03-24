import mockFunnel from './mock-funnel.js';
import gameSM from './sm.js';
import { GameENV } from '@tower-defense/utils';
import { setPool } from '@tower-defense/db';
import { GameStateMachine } from 'paima-engine/paima-db';

const mockRuntime = {
  initialize: (chainFunnel: any, sm: GameStateMachine) => {
    return {
      async run() {
        const latestReadBlockHeight = await sm.latestProcessedBlockHeight();
        const latestChainDataList = await chainFunnel.readData(latestReadBlockHeight + 1);
        for (const block of latestChainDataList) {
          await sm.process(block);
        }
        console.log('seeding complete');
      },
    };
  },
};
async function main() {
  console.log(GameENV.CONTRACT_ADDRESS);
  const chainFunnel = await mockFunnel.initialize(GameENV.CHAIN_URI, GameENV.CONTRACT_ADDRESS);
  setPool(gameSM.getReadonlyDbConn());
  const engine = mockRuntime.initialize(chainFunnel, gameSM);
  engine.run();
}

main();
