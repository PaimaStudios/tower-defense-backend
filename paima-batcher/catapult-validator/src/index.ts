import type { GameInputValidatorCore, ErrorCode } from "@paima-batcher/utils";
import { GenericRejectionCode } from "@paima-batcher/utils";
import {
    MAPS,
    ANIMALS,
    CATAPULT_ERROR_MESSAGES,
    CatapultRejectionCode,
    BOOLEANS,
} from "./constants.js";
import { queryLobbyState, queryRoundStatus } from "./query-constructors.js";

export { CATAPULT_ERROR_MESSAGES };

const MAX_ROUND_LENGTH = 15 * 60 * 24;

interface CatapultValidatorCore extends GameInputValidatorCore {
    backendUri: string;
}

const CatapultValidatorCoreInitializator = {
    async initialize(backendUri: string): Promise<CatapultValidatorCore> {
        return {
            backendUri,
            async validate(
                gameInput: string,
                userAddress: string
            ): Promise<ErrorCode> {
                try {
                    const cmd = gameInput.split("|")[0];
                    if (cmd === "c") {
                        return validateCreateLobby(gameInput);
                    } else if (cmd === "j") {
                        return validateJoinLobby(
                            gameInput,
                            userAddress,
                            backendUri
                        );
                    } else if (cmd === "s") {
                        return validateSubmitMoves(
                            gameInput,
                            userAddress,
                            backendUri
                        );
                    } else if (cmd === "n") {
                        return validateSetNft(gameInput);
                    } else if (cmd === "cs") {
                        return validateCloseLobby(
                            gameInput,
                            userAddress,
                            backendUri
                        );
                    } else {
                        return CatapultRejectionCode.INVALID_COMMAND;
                    }
                } catch (err) {
                    console.log(
                        "[catapult-validator] Error while validating:",
                        err
                    );
                    return GenericRejectionCode.INVALID_GAME_INPUT;
                }
            },
        };
    },
};

async function validateCreateLobby(gameInput: string): Promise<ErrorCode> {
    const elems = gameInput.split("|");
    if (elems.length != 9) {
        return CatapultRejectionCode.C_NUM_PARAMS;
    }
    const [
        cmd,
        numOfLivesStr,
        gridSizeStr,
        numOfRoundsStr,
        roundLengthStr,
        isHiddenStr,
        map,
        selectedAnimal,
        isPracticeStr
    ] = elems;

    if (cmd !== "c") {
        return CatapultRejectionCode.INVALID_COMMAND;
    }

    if (
        ![numOfLivesStr, gridSizeStr, numOfRoundsStr, roundLengthStr].every(
            parStr => /^[0-9]+$/.test(parStr)
        )
    ) {
        return CatapultRejectionCode.C_NONNUMERIC_ARGS;
        //return CatapultSpecificRejectionCode.CATAPULT_C_NONNUMERIC_ARGS;
    }

    const numOfLives = parseInt(numOfLivesStr);
    if (numOfLives < 1 || numOfLives > 10) {
        return CatapultRejectionCode.C_NUM_LIVES;
        //return CatapultSpecificRejectionCode.CATAPULT_C_NUM_LIVES;
    }

    const gridSize = parseInt(gridSizeStr);
    if (gridSize < 3 || gridSize > 5) {
        return CatapultRejectionCode.C_GRID_SIZE;
        //return CatapultSpecificRejectionCode.CATAPULT_C_GRID_SIZE;
    }

    const numOfRounds = parseInt(numOfRoundsStr);
    if (numOfRounds < 3 || numOfRounds > 100) {
        return CatapultRejectionCode.C_NUM_ROUNDS;
        //return CatapultSpecificRejectionCode.CATAPULT_C_NUM_ROUNDS;
    }

    const roundLength = parseInt(roundLengthStr);
    if (roundLength < 15 || roundLength > MAX_ROUND_LENGTH) {
        return CatapultRejectionCode.C_ROUND_LENGTH;
        //return CatapultSpecificRejectionCode.CATAPULT_C_ROUND_LENGTH;
    }

    if (!BOOLEANS.includes(isHiddenStr)) {
        return CatapultRejectionCode.C_HIDDEN;
    }

    if (!MAPS.includes(map)) {
        return CatapultRejectionCode.C_MAP;
        //return CatapultSpecificRejectionCode.CATAPULT_C_MAP;
    }

    if (!ANIMALS.includes(selectedAnimal)) {
        return CatapultRejectionCode.C_ANIMAL;
        //return CatapultSpecificRejectionCode.CATAPULT_C_ANIMAL;
    }

    if (!BOOLEANS.includes(isPracticeStr)) {
        return CatapultRejectionCode.C_PRACTICE;
    }

    return 0;
}

async function validateJoinLobby(
    gameInput: string,
    userAddress: string,
    backendUri: string
): Promise<ErrorCode> {
    const elems = gameInput.split("|");
    if (elems.length != 3) {
        return CatapultRejectionCode.J_NUM_PARAMS;
        //return CatapultSpecificRejectionCode.CATAPULT_J_NUM_PARAMS;
    }

    const [cmd, lobbyIdStar, selectedAnimal] = elems;

    if (cmd !== "j") {
        return CatapultRejectionCode.INVALID_COMMAND;
        //return CatapultSpecificRejectionCode.CATAPULT_INVALID_COMMAND;
    }

    if (lobbyIdStar[0] !== "*") {
        return CatapultRejectionCode.J_INVALID_LOBBY_ID;
        //return CatapultSpecificRejectionCode.CATAPULT_J_INVALID_LOBBY_ID;
    }
    const lobbyID = lobbyIdStar.slice(1);
    const joinValidationResult = await canJoinLobby(
        lobbyID,
        userAddress,
        backendUri
    );
    if (joinValidationResult !== 0) {
        return joinValidationResult;
    }

    if (!ANIMALS.includes(selectedAnimal)) {
        return CatapultRejectionCode.J_ANIMAL;
        //return CatapultSpecificRejectionCode.CATAPULT_J_ANIMAL;
    }

    return 0;
}

async function validateSubmitMoves(
    gameInput: string,
    userAddress: string,
    backendUri: string
): Promise<ErrorCode> {
    const elems = gameInput.split("|");
    if (elems.length != 6) {
        return CatapultRejectionCode.S_NUM_PARAMS;
        //return CatapultSpecificRejectionCode.CATAPULT_S_NUM_PARAMS;
    }

    const [cmd, lobbyIdStar, roundNumberStr, move1, move2, move3] = elems;

    if (cmd !== "s") {
        //console.log("[catapult-validator] Invalid command")
        return CatapultRejectionCode.INVALID_COMMAND;
        //return CatapultSpecificRejectionCode.CATAPULT_INVALID_COMMAND;
    }

    if (lobbyIdStar[0] !== "*") {
        //console.log("[catapult-validator] Invalid lobbyID")
        return CatapultRejectionCode.S_INVALID_LOBBY_ID;
        //return CatapultSpecificRejectionCode.CATAPULT_S_INVALID_LOBBY_ID;
    }

    const lobbyID = lobbyIdStar.slice(1);
    if (!/^[0-9]+$/.test(roundNumberStr)) {
        //console.log("[catapult-validator] Non-numeric round number")
        return CatapultRejectionCode.S_NONNUMERIC_ROUND_NUMBER;
        //return CatapultSpecificRejectionCode.CATAPULT_S_NONNUMERIC_ROUND_NUMBER;
    }
    const roundNumber = parseInt(roundNumberStr);
    const [errorCode, gridSize] = await validateLobbyGetGridSize(
        lobbyID,
        userAddress,
        roundNumber,
        backendUri
    );
    if (errorCode !== 0) {
        //console.log("[catapult-validator] Failed to validate lobby")
        return errorCode;
    }

    const moveValidation = [move1, move2, move3].map((m) => validateMove(m, gridSize));
    const firstInvalid = moveValidation.findIndex(s => s !== 0);
    if (firstInvalid >= 0) {
        return moveValidation[firstInvalid];
    }

    return 0;
}

async function validateSetNft(gameInput: string): Promise<ErrorCode> {
    const elems = gameInput.split("|");
    if (elems.length != 3) {
        return CatapultRejectionCode.N_NUM_PARAMS;
        //return CatapultSpecificRejectionCode.CATAPULT_N_NUM_PARAMS;
    }
    const [cmd, nftAddress, nftIdStr] = elems;
    if (cmd !== "n") {
        return CatapultRejectionCode.INVALID_COMMAND;
        //return CatapultSpecificRejectionCode.CATAPULT_INVALID_COMMAND;
    }

    if (!/^[0-9]+$/.test(nftIdStr)) {
        return CatapultRejectionCode.N_NONNUMERIC_TOKEN_ID;
        //return CatapultSpecificRejectionCode.CATAPULT_N_NONNUMERIC_TOKEN_ID;
    }
    const nftId = parseInt(nftIdStr);
    if (nftId < 0) {
        return CatapultRejectionCode.N_NEGATIVE_TOKEN_ID;
        //return CatapultSpecificRejectionCode.CATAPULT_N_NEGATIVE_TOKEN_ID;
    }
    return 0;
}

async function validateCloseLobby(
    gameInput: string,
    userAddress: string,
    backendUri: string
): Promise<ErrorCode> {
    const elems = gameInput.split("|");
    if (elems.length != 2) {
        return CatapultRejectionCode.CS_NUM_PARAMS;
        //return CatapultSpecificRejectionCode.CATAPULT_J_NUM_PARAMS;
    }

    const [cmd, lobbyIdStar] = elems;

    if (cmd !== "cs") {
        return CatapultRejectionCode.INVALID_COMMAND;
        //return CatapultSpecificRejectionCode.CATAPULT_INVALID_COMMAND;
    }

    if (lobbyIdStar[0] !== "*") {
        return CatapultRejectionCode.CS_INVALID_LOBBY_ID;
        //return CatapultSpecificRejectionCode.CATAPULT_J_INVALID_LOBBY_ID;
    }
    const lobbyID = lobbyIdStar.slice(1);
    const closeValidationResult = await canCloseLobby(
        lobbyID,
        userAddress,
        backendUri
    );
    if (closeValidationResult !== 0) {
        return closeValidationResult;
    }

    return 0;
}

async function canJoinLobby(
    lobbyID: string,
    userAddress: string,
    backendUri: string
): Promise<ErrorCode> {
    try {
        const query = queryLobbyState(backendUri, lobbyID);
        const lobbyStateResponse = await fetch(query);
        const lobbyState = await lobbyStateResponse.json();
        if (!lobbyState.lobby) {
            //console.log("[catapult-validator] Lobby does not exist");
            return CatapultRejectionCode.J_NONEXISTENT_LOBBY;
            //return CatapultSpecificRejectionCode.CATAPULT_J_NONEXISTENT_LOBBY;
        }
        if (lobbyState.lobby.lobby_id !== lobbyID) {
            //console.log("[catapult-validator] Lobby with different ID returned");
            return CatapultRejectionCode.J_INVALID_LOBBY_ID;
            //return CatapultSpecificRejectionCode.CATAPULT_J_INVALID_LOBBY_ID;
        }
        if (lobbyState.lobby.lobby_state !== "open") {
            //console.log("[catapult-validator] Lobby not open");
            return CatapultRejectionCode.J_LOBBY_NOT_OPEN;
            //return CatapultSpecificRejectionCode.CATAPULT_J_LOBBY_NOT_OPEN;
        }
        if (lobbyState.lobby.lobby_creator === userAddress.toLowerCase()) {
            //console.log("[catapult-validator] Cannot join own lobby");
            return CatapultRejectionCode.J_PLAYER_CREATED_LOBBY;
            //return CatapultSpecificRejectionCode.CATAPULT_J_PLAYER_CREATED_LOBBY;
        }
        return 0;
    } catch (err) {
        console.log(
            "[catapult-validator] Error while querying lobby state:",
            err
        );
        return CatapultRejectionCode.J_UNKNOWN;
        //return CatapultSpecificRejectionCode.CATAPULT_J_UNKNOWN;
    }
}

async function canCloseLobby(
    lobbyID: string,
    userAddress: string,
    backendUri: string
): Promise<ErrorCode> {
    try {
        const query = queryLobbyState(backendUri, lobbyID);
        const lobbyStateResponse = await fetch(query);
        const lobbyState = await lobbyStateResponse.json();
        if (!lobbyState.lobby) {
            //console.log("[catapult-validator] Lobby does not exist");
            return CatapultRejectionCode.CS_NONEXISTENT_LOBBY;
            //return CatapultSpecificRejectionCode.CATAPULT_J_NONEXISTENT_LOBBY;
        }
        if (lobbyState.lobby.lobby_id !== lobbyID) {
            //console.log("[catapult-validator] Lobby with different ID returned");
            return CatapultRejectionCode.CS_INVALID_LOBBY_ID;
            //return CatapultSpecificRejectionCode.CATAPULT_J_INVALID_LOBBY_ID;
        }
        if (lobbyState.lobby.lobby_state !== "open") {
            //console.log("[catapult-validator] Lobby not open");
            return CatapultRejectionCode.CS_LOBBY_NOT_OPEN;
            //return CatapultSpecificRejectionCode.CATAPULT_J_LOBBY_NOT_OPEN;
        }
        if (lobbyState.lobby.lobby_creator !== userAddress.toLowerCase()) {
            //console.log("[catapult-validator] Cannot join own lobby");
            return CatapultRejectionCode.CS_PLAYER_DIDNT_CREATE_LOBBY;
            //return CatapultSpecificRejectionCode.CATAPULT_J_PLAYER_CREATED_LOBBY;
        }
        return 0;
    } catch (err) {
        console.log(
            "[catapult-validator] Error while querying lobby state:",
            err
        );
        return CatapultRejectionCode.CS_UNKNOWN;
        //return CatapultSpecificRejectionCode.CATAPULT_J_UNKNOWN;
    }
}

async function validateLobbyGetGridSize(
    lobbyID: string,
    userAddress: string,
    currentRound: number,
    backendUri: string
): Promise<[ErrorCode, number]> {
    userAddress = userAddress.toLowerCase();
    try {
        const queryLobby = queryLobbyState(backendUri, lobbyID);
        const lobbyStateResponse = await fetch(queryLobby);
        const lobbyState = await lobbyStateResponse.json();
        if (lobbyState.lobby === null) {
            console.log("[catapult-validator] Lobby does not exist");
            return [CatapultRejectionCode.S_NONEXISTENT_LOBBY, 0];
        }
        if (lobbyState.lobby.lobby_id !== lobbyID) {
            console.log(
                "[catapult-validator] Lobby with different ID returned"
            );
            return [CatapultRejectionCode.S_INVALID_LOBBY_ID, 0];
        }
        if (lobbyState.lobby.lobby_state !== "active") {
            console.log("[catapult-validator] Lobby not active");
            return [CatapultRejectionCode.S_LOBBY_NOT_ACTIVE, 0];
        }
        if (lobbyState.lobby.current_round !== currentRound) {
            console.log("[catapult-validator] Lobby in a different round");
            return [CatapultRejectionCode.S_WRONG_ROUND, 0];
        }
        if (
            lobbyState.lobby.lobby_creator !== userAddress &&
            lobbyState.lobby.player_two !== userAddress
        ) {
            console.log("[catapult-validator] Player not in lobby");
            return [CatapultRejectionCode.S_PLAYER_NOT_IN_LOBBY, 0];
        }

        const queryRound = queryRoundStatus(backendUri, lobbyID, currentRound);
        const roundStateResponse = await fetch(queryRound);
        const roundState = await roundStateResponse.json();
        if (roundState.round.usersWhoSubmittedMoves.includes(userAddress)) {
            console.log("[catapult-validator] Player already submitted moves");
            return [CatapultRejectionCode.S_REPEATED_SUBMIT, 0];
        }

        return [0, lobbyState.lobby.grid_size];
    } catch (err) {
        console.log(
            "[catapult-validator] Error while querying lobby state:",
            err
        );
        return [CatapultRejectionCode.S_UNKNOWN, 0];
    }
}

function validateMove(move: string, gridSize: number): ErrorCode {
    const [moveType, movePar] = [move[0], move.slice(1)];
    if (moveType === "t") {
        return movePar === "" ? 0 : CatapultRejectionCode.S_TAUNT_PARAM;
    } else if (moveType === "f" || moveType === "r") {
        if (!/^[0-9]+$/.test(movePar)) {
            return CatapultRejectionCode.S_NONNUMERIC_POSITION;
        }
        const position = parseInt(movePar);
        return position >= 1 && position <= gridSize
            ? 0
            : CatapultRejectionCode.S_INVALID_POSITION;
    } else {
        return CatapultRejectionCode.S_UNSUPPORTED_MOVE;
    }
}

export default CatapultValidatorCoreInitializator;
