import { ErrorCode, GameInputValidatorCoreType, GENERIC_ERROR_MESSAGES } from "@paima-batcher/utils";
import { TOWER_DEFENSE_ERROR_MESSAGES } from "@paima-batcher/tower-defense-validator";

function getSpecificErrors(validatorType: GameInputValidatorCoreType): Record<ErrorCode, string> {
    switch (validatorType) {
        case GameInputValidatorCoreType.NO_VALIDATION:
            return {};
        case GameInputValidatorCoreType.TOWER_DEFENSE:
            return TOWER_DEFENSE_ERROR_MESSAGES;
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