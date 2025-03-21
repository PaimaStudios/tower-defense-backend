// A Hardhat module representing what should be deployed locally.
// Includes a Genesis Trainer contract so we have something to test against.
import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import type { IgnitionModuleBuilder } from '@nomicfoundation/ignition-core';

export default buildModule('L2Contract', (m: IgnitionModuleBuilder) => {
  // https://github.com/NomicFoundation/hardhat-ignition/issues/673
  const l2Contract = m.contract('PaimaL2Contract', [m.getAccount(0), 1]);

  const annotatedMintNft = m.contract('AnnotatedMintNft', [
    'GENESIS TRAINER',
    'GT',
    10000,
    m.getAccount(0),
  ], {
    after: [l2Contract]
  });

  return { l2Contract, annotatedMintNft };
});
