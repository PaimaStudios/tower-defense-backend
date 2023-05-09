import { ErrorCode, GameInputValidatorCoreType, GENERIC_ERROR_MESSAGES } from "@paima-batcher/utils";
import { CATAPULT_ERROR_MESSAGES } from "@paima-batcher/catapult-validator";

function getSpecificErrors(validatorType: GameInputValidatorCoreType): Record<ErrorCode, string> {
    switch (validatorType) {
        case GameInputValidatorCoreType.NO_VALIDATION:
            return {};
        case GameInputValidatorCoreType.CATAPULT:
            return CATAPULT_ERROR_MESSAGES;
        default:
            return {};
    }
}

export function getErrors(validatorType: GameInputValidatorCoreType): Record<ErrorCode, string> {
    return {
        ...GENERIC_ERROR_MESSAGES,
        ...getSpecificErrors(validatorType),
    };
}