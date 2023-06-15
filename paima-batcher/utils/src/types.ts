export type ErrorCode = number;

export type ErrorMessageFxn = (errorCode: ErrorCode) => string;

export interface GameInputValidatorCore {
  validate: (gameInput: string, userAddress: string) => Promise<ErrorCode>;
}

export interface UserInput {
  addressType: number;
  userAddress: string;
  gameInput: string;
  userSignature: string;
  millisecondTimestamp: string;
}

export const enum GenericRejectionCode {
  OK = 0,
  UNSUPPORTED_ADDRESS_TYPE,
  INVALID_ADDRESS,
  INVALID_SIGNATURE,
  ADDRESS_NOT_ALLOWED,

  INVALID_GAME_INPUT = 100,
}

export const enum GameInputValidatorCoreType {
  NO_VALIDATION,
  TOWER_DEFENSE,
}
