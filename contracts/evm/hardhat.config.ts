import '@nomicfoundation/hardhat-chai-matchers';
import '@nomicfoundation/hardhat-ethers';
import '@nomicfoundation/hardhat-ignition-viem';
import '@nomicfoundation/hardhat-toolbox-viem';
import { ChildProcess, spawn } from 'child_process';
import { open } from 'fs/promises';
import 'hardhat-abi-exporter';
import 'hardhat-dependency-compiler';
import 'hardhat-interact';
import { task, type HardhatUserConfig } from 'hardhat/config';
import { type HardhatRuntimeEnvironment } from 'hardhat/types';

const config: HardhatUserConfig = {
  solidity: '0.8.20',
  paths: {
    sources: './solidity',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts',
    ignition: './ignition',
  },
  networks: {
    // note: localhost / hardhat networks exist implicitly
    // hardhat is in-process (temporal) created for single commands. localhost is persisted by `npx hardhat node`
    hardhat: {
      // 31337 is a magic number to not request confirmation before contract deployment
      chainId: 31337,
      mining: {
        auto: true,
        interval: 2000,
      },
    },
  },
  dependencyCompiler: {
    paths: [
      '@paima/evm-contracts/contracts/PaimaL2Contract.sol',
      '@paima/evm-contracts/contracts/AnnotatedMintNft.sol',
    ],
  },
  abiExporter: {
    path: './abi',
    runOnCompile: true,
    tsWrapper: true,
    clear: true,
    flat: false,
  },
};

// node-with-contracts is node + deploy-to-localhost in one for easier dev.
task('node').setAction(async (args, hre: HardhatRuntimeEnvironment, runSuper) => {
  // It would be simpler here to run ignition in-process with hre.run(),
  // but this would leave no record for `hardhat interact` to use.
  let ignition: ChildProcess;
  process.on('exit', () => ignition?.kill());

  // Boot the Hardhat node.
  const node = runSuper.isDefined ? runSuper() : hre.run('node');
  // Technically a race here for hardhat-node to listen on the socket
  // before hardhat-ignition tries to connect. If needed, sleep here.
  ignition = spawn(
    'hardhat',
    [
      'ignition',
      'deploy',
      './ignition/modules/deploy.ts',
      '--parameters', './ignition/parameters.json',
      '--network', 'localhost',
      '--reset',  // So we don't have to manually rm -rf the deploy journal.
    ],
    {
      stdio: 'inherit',
    }
  );
  await new Promise<void>((resolve, reject) => {
    ignition.on('exit', (code, signal) => {
      if (signal !== null) {
        reject(`hardhat ignition: exited signal ${signal}`);
      } else if (code !== 0) {
        reject(`hardhat ignition: exited with code ${code}`);
      } else {
        resolve();
      }
    });
  });
  // Create contracts.stamp now that it's done.
  await (await open('contracts.stamp', 'w')).close();
  // Now the contracts are deployed, and `npx hardhat interact --network localhost` works.
  // Just be the node for the rest of time.
  await node;
});

export default config;
