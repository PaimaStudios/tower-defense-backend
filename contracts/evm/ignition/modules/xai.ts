// A Hardhat module that represents what TD should actually deploy to Xai.
// Excludes Tarochi Genesis Trainers because that contract's deployment is
// not Tower Defense's responsibility.
import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import type { IgnitionModuleBuilder } from '@nomicfoundation/ignition-core';

export default buildModule('L2Contract', (m: IgnitionModuleBuilder) => {
  // https://github.com/NomicFoundation/hardhat-ignition/issues/673
  const l2Contract = m.contract('PaimaL2Contract', [m.getAccount(0), 1]);

  return { l2Contract };
});
