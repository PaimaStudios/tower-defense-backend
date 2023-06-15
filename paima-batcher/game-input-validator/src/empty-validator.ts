import type { ErrorCode, GameInputValidatorCore } from '@paima-batcher/utils';

type EmptyInputValidatorCore = GameInputValidatorCore;

export const EmptyInputValidatorCoreInitializator = {
  async initialize(): Promise<EmptyInputValidatorCore> {
    return {
      async validate(gameInput: string, userAddress: string): Promise<ErrorCode> {
        return 0;
      },
    };
  },
};
