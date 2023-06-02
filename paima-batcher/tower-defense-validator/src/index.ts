import type { GameInputValidatorCore, ErrorCode } from "@paima-batcher/utils";
import { GenericRejectionCode } from "@paima-batcher/utils";
import {
    MAPS,
    TOWER_DEFENSE_ERROR_MESSAGES,
    TowerDefenseRejectionCode,
    BOOLEANS,
    FACTIONS,
} from "./constants.js";
import { queryLobbyState, queryRoundStatus } from "./query-constructors.js";

export { TOWER_DEFENSE_ERROR_MESSAGES };

const BLOCKS_PER_MINUTE = 30;
const BLOCKS_PER_DAY = BLOCKS_PER_MINUTE * 60 * 24;
const MIN_ROUND_LENGTH = BLOCKS_PER_MINUTE;
const MAX_ROUND_LENGTH = BLOCKS_PER_DAY;

interface TowerDefenseValidatorCore extends GameInputValidatorCore {
    backendUri: string;
}

const TowerDefenseValidatorCoreInitializator = {
    async initialize(backendUri: string): Promise<TowerDefenseValidatorCore> {
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
                    } else if (cmd === "r") {
                        return TowerDefenseRejectionCode.R_NOT_SUPPORTED;
                    } else {
                        return TowerDefenseRejectionCode.INVALID_COMMAND;
                    }
                } catch (err) {
                    console.log(
                        "[tower-defense-validator] Error while validating:",
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
    if (elems.length != 8) {
        return TowerDefenseRejectionCode.C_NUM_PARAMS;
    }
    const [
        cmd,
        matchConfigID,
        creatorFaction,
        numOfRoundsStr,
        roundLengthStr,
        isHiddenStr,
        map,
        isPracticeStr
    ] = elems;

    if (cmd !== "c") {
        return TowerDefenseRejectionCode.INVALID_COMMAND;
    }

    if (matchConfigID.length !== 14) {
        return TowerDefenseRejectionCode.C_INVALID_MATCH_CONFIG_ID;
    }

    if (!FACTIONS.includes(creatorFaction)) {
        return TowerDefenseRejectionCode.C_FACTION;
    }

    if (
        ![numOfRoundsStr, roundLengthStr].every(
            parStr => /^[0-9]+$/.test(parStr)
        )
    ) {
        return TowerDefenseRejectionCode.C_NONNUMERIC_ARGS;
    }

    const numOfRounds = parseInt(numOfRoundsStr);
    if (numOfRounds < 3 || numOfRounds > 1000) {
        return TowerDefenseRejectionCode.C_NUM_ROUNDS;
    }

    const roundLength = parseInt(roundLengthStr);
    if (roundLength < MIN_ROUND_LENGTH || roundLength > MAX_ROUND_LENGTH) {
        return TowerDefenseRejectionCode.C_ROUND_LENGTH;
    }

    if (!BOOLEANS.includes(isHiddenStr)) {
        return TowerDefenseRejectionCode.C_HIDDEN;
    }

    if (!MAPS.includes(map)) {
        return TowerDefenseRejectionCode.C_MAP;
    }

    if (!BOOLEANS.includes(isPracticeStr)) {
        return TowerDefenseRejectionCode.C_PRACTICE;
    }

    return 0;
}

async function validateJoinLobby(
    gameInput: string,
    userAddress: string,
    backendUri: string
): Promise<ErrorCode> {
    const elems = gameInput.split("|");
    if (elems.length != 2) {
        return TowerDefenseRejectionCode.J_NUM_PARAMS;
    }

    const [cmd, lobbyIdStar] = elems;

    if (cmd !== "j") {
        return TowerDefenseRejectionCode.INVALID_COMMAND;
    }

    if (lobbyIdStar[0] !== "*" || lobbyIdStar.length !== 13) {
        return TowerDefenseRejectionCode.J_INVALID_LOBBY_ID;
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

    return 0;
}

async function validateSubmitMoves(
    gameInput: string,
    userAddress: string,
    backendUri: string
): Promise<ErrorCode> {
    const elems = gameInput.split("|");
    if (elems.length < 4) {
        return TowerDefenseRejectionCode.S_NUM_PARAMS;
    }

    const [cmd, lobbyIdStar, roundNumberStr, ...moves] = elems;

    if (cmd !== "s") {
        //console.log("[tower-defense-validator] Invalid command")
        return TowerDefenseRejectionCode.INVALID_COMMAND;
    }

    if (lobbyIdStar[0] !== "*" || lobbyIdStar.length !== 13) {
        //console.log("[tower-defense-validator] Invalid lobbyID")
        return TowerDefenseRejectionCode.S_INVALID_LOBBY_ID;
    }

    const lobbyID = lobbyIdStar.slice(1);
    if (!/^[0-9]+$/.test(roundNumberStr)) {
        //console.log("[tower-defense-validator] Non-numeric round number")
        return TowerDefenseRejectionCode.S_NONNUMERIC_ROUND_NUMBER;
    }
    const roundNumber = parseInt(roundNumberStr);

    /*
    const [errorCode, gridSize] = await validateLobbyGetGridSize(
        lobbyID,
        userAddress,
        roundNumber,
        backendUri
    );
    if (errorCode !== 0) {
        //console.log("[tower-defense-validator] Failed to validate lobby")
        return errorCode;
    }

    const moveValidation = [move1, move2, move3].map((m) => validateMove(m, gridSize));
    const firstInvalid = moveValidation.findIndex(s => s !== 0);
    if (firstInvalid >= 0) {
        return moveValidation[firstInvalid];
    }
    */

    return -1;
}

async function validateSetNft(gameInput: string): Promise<ErrorCode> {
    const elems = gameInput.split("|");
    if (elems.length != 3) {
        return TowerDefenseRejectionCode.N_NUM_PARAMS;
    }
    const [cmd, nftAddress, nftIdStr] = elems;
    if (cmd !== "n") {
        return TowerDefenseRejectionCode.INVALID_COMMAND;
    }

    if (!/^[0-9]+$/.test(nftIdStr)) {
        return TowerDefenseRejectionCode.N_NONNUMERIC_TOKEN_ID;
    }
    const nftId = parseInt(nftIdStr);
    if (nftId < 0) {
        return TowerDefenseRejectionCode.N_NEGATIVE_TOKEN_ID;
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
        return TowerDefenseRejectionCode.CS_NUM_PARAMS;
    }

    const [cmd, lobbyIdStar] = elems;

    if (cmd !== "cs") {
        return TowerDefenseRejectionCode.INVALID_COMMAND;
    }

    if (lobbyIdStar[0] !== "*" || lobbyIdStar.length !== 13) {
        return TowerDefenseRejectionCode.CS_INVALID_LOBBY_ID;
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
            //console.log("[tower-defense-validator] Lobby does not exist");
            return TowerDefenseRejectionCode.J_NONEXISTENT_LOBBY;
        }
        if (lobbyState.lobby.lobby_id !== lobbyID) {
            //console.log("[tower-defense-validator] Lobby with different ID returned");
            return TowerDefenseRejectionCode.J_INVALID_LOBBY_ID;
        }
        if (lobbyState.lobby.lobby_state !== "open") {
            //console.log("[tower-defense-validator] Lobby not open");
            return TowerDefenseRejectionCode.J_LOBBY_NOT_OPEN;
        }
        if (lobbyState.lobby.lobby_creator === userAddress.toLowerCase()) {
            //console.log("[tower-defense-validator] Cannot join own lobby");
            return TowerDefenseRejectionCode.J_PLAYER_CREATED_LOBBY;
        }
        return 0;
    } catch (err) {
        console.log(
            "[tower-defense-validator] Error while querying lobby state:",
            err
        );
        return TowerDefenseRejectionCode.J_UNKNOWN;
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
            //console.log("[tower-defense-validator] Lobby does not exist");
            return TowerDefenseRejectionCode.CS_NONEXISTENT_LOBBY;
        }
        if (lobbyState.lobby.lobby_id !== lobbyID) {
            //console.log("[tower-defense-validator] Lobby with different ID returned");
            return TowerDefenseRejectionCode.CS_INVALID_LOBBY_ID;
        }
        if (lobbyState.lobby.lobby_state !== "open") {
            //console.log("[tower-defense-validator] Lobby not open");
            return TowerDefenseRejectionCode.CS_LOBBY_NOT_OPEN;
        }
        if (lobbyState.lobby.lobby_creator !== userAddress.toLowerCase()) {
            //console.log("[tower-defense-validator] Cannot join own lobby");
            return TowerDefenseRejectionCode.CS_PLAYER_DIDNT_CREATE_LOBBY;
        }
        return 0;
    } catch (err) {
        console.log(
            "[tower-defense-validator] Error while querying lobby state:",
            err
        );
        return TowerDefenseRejectionCode.CS_UNKNOWN;
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
            console.log("[tower-defense-validator] Lobby does not exist");
            return [TowerDefenseRejectionCode.S_NONEXISTENT_LOBBY, 0];
        }
        if (lobbyState.lobby.lobby_id !== lobbyID) {
            console.log(
                "[tower-defense-validator] Lobby with different ID returned"
            );
            return [TowerDefenseRejectionCode.S_INVALID_LOBBY_ID, 0];
        }
        if (lobbyState.lobby.lobby_state !== "active") {
            console.log("[tower-defense-validator] Lobby not active");
            return [TowerDefenseRejectionCode.S_LOBBY_NOT_ACTIVE, 0];
        }
        if (lobbyState.lobby.current_round !== currentRound) {
            console.log("[tower-defense-validator] Lobby in a different round");
            return [TowerDefenseRejectionCode.S_WRONG_ROUND, 0];
        }
        if (
            lobbyState.lobby.lobby_creator !== userAddress &&
            lobbyState.lobby.player_two !== userAddress
        ) {
            console.log("[tower-defense-validator] Player not in lobby");
            return [TowerDefenseRejectionCode.S_PLAYER_NOT_IN_LOBBY, 0];
        }

        const queryRound = queryRoundStatus(backendUri, lobbyID, currentRound);
        const roundStateResponse = await fetch(queryRound);
        const roundState = await roundStateResponse.json();
        if (roundState.round.usersWhoSubmittedMoves.includes(userAddress)) {
            console.log("[tower-defense-validator] Player already submitted moves");
            return [TowerDefenseRejectionCode.S_REPEATED_SUBMIT, 0];
        }

        return [0, lobbyState.lobby.grid_size];
    } catch (err) {
        console.log(
            "[tower-defense-validator] Error while querying lobby state:",
            err
        );
        return [TowerDefenseRejectionCode.S_UNKNOWN, 0];
    }
}

function validateMove(move: string, gridSize: number): ErrorCode {
    const [moveType, movePar] = [move[0], move.slice(1)];
    if (moveType === "t") {
        return movePar === "" ? 0 : TowerDefenseRejectionCode.S_TAUNT_PARAM;
    } else if (moveType === "f" || moveType === "r") {
        if (!/^[0-9]+$/.test(movePar)) {
            return TowerDefenseRejectionCode.S_NONNUMERIC_POSITION;
        }
        const position = parseInt(movePar);
        return position >= 1 && position <= gridSize
            ? 0
            : TowerDefenseRejectionCode.S_INVALID_POSITION;
    } else {
        return TowerDefenseRejectionCode.S_UNSUPPORTED_MOVE;
    }
}

export default TowerDefenseValidatorCoreInitializator;
