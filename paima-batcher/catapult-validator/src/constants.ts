import { GenericRejectionCode } from "@paima-batcher/utils";

export const MAPS = ["jungle", "ocean"];

export const ANIMALS = [
    "piranha",
    "gorilla",
    "anaconda",
    "jaguar",
    "macaw",
    "sloth",
];

export const BOOLEANS = ["T", "F", ""];

export const CATAPULT_ERROR_MESSAGES: Record<CatapultRejectionCode, string> = {
    [CatapultRejectionCode.INVALID_COMMAND]:
        "The supplied game input does not correspond to any supported command",

    [CatapultRejectionCode.C_NUM_PARAMS]:
        "The createLobby command requires a different number of parameters",
    [CatapultRejectionCode.C_NONNUMERIC_ARGS]:
        "One or more of the numeric parameters of createLobby have a non-numeric value",
    [CatapultRejectionCode.C_NUM_LIVES]:
        "The number of lives parameter is out of range",
    [CatapultRejectionCode.C_GRID_SIZE]:
        "The grid size parameter is out of range",
    [CatapultRejectionCode.C_NUM_ROUNDS]:
        "The number of rounds parameter is out of range",
    [CatapultRejectionCode.C_ROUND_LENGTH]:
        "The round length parameter is out of range",
    [CatapultRejectionCode.C_HIDDEN]:
        "The isHidden parameter is not a valid boolean value",
    [CatapultRejectionCode.C_MAP]:
        "The selected map does not exist or is not supported",
    [CatapultRejectionCode.C_ANIMAL]:
        "The selected animal does not exist or is not supported",
    [CatapultRejectionCode.C_PRACTICE]:
        "The isPractice parameter is not a valid boolean value",
    [CatapultRejectionCode.C_UNKNOWN]:
        "Unknown error while processing a createLobby command",

    [CatapultRejectionCode.J_NUM_PARAMS]:
        "The joinLobby command requires a different number of parameters",
    [CatapultRejectionCode.J_INVALID_LOBBY_ID]:
        "The supplied lobby ID is invalid",
    [CatapultRejectionCode.J_NONEXISTENT_LOBBY]:
        "The specified lobby does not exist",
    [CatapultRejectionCode.J_LOBBY_NOT_OPEN]: "The specified lobby is not open",
    [CatapultRejectionCode.J_PLAYER_CREATED_LOBBY]:
        "A player cannot join their own lobby",
    [CatapultRejectionCode.J_ANIMAL]:
        "The selected animal does not exist or is not supported",
    [CatapultRejectionCode.J_UNKNOWN]:
        "Unknown error while processing a joinLobby command",

    [CatapultRejectionCode.S_NUM_PARAMS]:
        "The submitMoves command requires a different number of parameters",
    [CatapultRejectionCode.S_INVALID_LOBBY_ID]:
        "The supplied lobby ID is invalid",
    [CatapultRejectionCode.S_NONNUMERIC_ROUND_NUMBER]:
        "The supplied round number is not a valid integer",
    [CatapultRejectionCode.S_NONEXISTENT_LOBBY]:
        "The specified lobby does not exist",
    [CatapultRejectionCode.S_LOBBY_NOT_ACTIVE]:
        "The specified lobby is not active",
    [CatapultRejectionCode.S_WRONG_ROUND]:
        "The supplied round number does not correspond to the current round of the specified lobby",
    [CatapultRejectionCode.S_PLAYER_NOT_IN_LOBBY]:
        "The user is not in the specified lobby",
    [CatapultRejectionCode.S_REPEATED_SUBMIT]:
        "The user has already submitted their moves for this round",
    [CatapultRejectionCode.S_TAUNT_PARAM]:
        "Invalid moves: the taunt move takes no parameters",
    [CatapultRejectionCode.S_NONNUMERIC_POSITION]:
        "Invalid moves: the position parameter must be a number",
    [CatapultRejectionCode.S_INVALID_POSITION]:
        "Invalid moves: a position parameter is out of range",
    [CatapultRejectionCode.S_UNSUPPORTED_MOVE]:
        "Invalid moves: one or more unknown or unsupported moves",
    [CatapultRejectionCode.S_INVALID_MOVES]:
        "One or more of the specified moves are invalid",
    [CatapultRejectionCode.S_UNKNOWN]:
        "Unknown error while processing a submitMoves command",

    [CatapultRejectionCode.N_NUM_PARAMS]:
        "The setNft command requires a different number of parameters",
    [CatapultRejectionCode.N_NONNUMERIC_TOKEN_ID]:
        "The supplied token ID is not a valid integer",
    [CatapultRejectionCode.N_NEGATIVE_TOKEN_ID]:
        "The supplied token ID is negative",
    [CatapultRejectionCode.N_UNKNOWN]:
        "Unknown error while processing a setNft command",

    [CatapultRejectionCode.CS_NUM_PARAMS]:
        "The closeLobby command requires a different number of parameters",
    [CatapultRejectionCode.CS_INVALID_LOBBY_ID]:
        "The supplied lobby ID is invalid",
    [CatapultRejectionCode.CS_NONEXISTENT_LOBBY]:
        "The specified lobby does not exist",
    [CatapultRejectionCode.CS_LOBBY_NOT_OPEN]: "The specified lobby is not open",
    [CatapultRejectionCode.CS_PLAYER_DIDNT_CREATE_LOBBY]:
        "A player can only close their own lobby",
    [CatapultRejectionCode.J_UNKNOWN]:
        "Unknown error while processing a closeLobby command",
};

/*
export const CATAPULT_ERROR_MESSAGES = {
    "cat:invalid-command":           "The supplied game input does not correspond to any supported command",

    "cat:c-num-params":              "The createLobby command requires a different number of parameters",
    "cat:c-nonnumeric-args":         "One or more of the numeric parameters of createLobby have a non-numeric value",
    "cat:c-num-lives":               "The number of lives parameter is out of range",
    "cat:c-grid-size":               "The grid size parameter is out of range",
    "cat:c-num-rounds":              "The number of rounds parameter is out of range",
    "cat:c-round-length":            "The round length parameter is out of range",
    "cat:c-map":                     "The selected map does not exist or is not supported",
    "cat:c-animal":                  "The selected animal does not exist or is not supported",
    "cat:c-unknown":                 "Unknown error while processing a createLobby command",

    "cat:j-num-params":              "The joinLobby command requires a different number of parameters",
    "cat:j-invalid-lobby-id":        "The supplied lobby ID is invalid",
    "cat:j-nonexistent-lobby":       "The specified lobby does not exist",
    "cat:j-lobby-not-open":          "The specified lobby is not open",
    "cat:j-player-created-lobby":    "A player cannot join their own lobby",
    "cat:j-animal":                  "The selected animal does not exist or is not supported",
    "cat:j-unknown":                 "Unknown error while processing a joinLobby command",

    "cat:s-num-params":              "The submitMoves command requires a different number of parameters",
    "cat:s-invalid-lobby-id":        "The supplied lobby ID is invalid",
    "cat:s-nonnumeric-round-number": "The supplied round number is not a valid integer",
    "cat:s-nonexistent-lobby":       "The specified lobby does not exist",
    "cat:s-lobby-not-active":        "The specified lobby is not active",
    "cat:s-wrong-round":             "The supplied round number does not correspond to the current round of the specified lobby",
    "cat:s-player-not-in-lobby":     "The user is not in the specified lobby",
    "cat:s-repeated-submit":         "The user has already submitted their moves for this round",
    "cat:s-taunt-par":               "Invalid moves: the taunt move takes no parameters",
    "cat:s-nonnumeric-position":     "Invalid moves: the position parameter must be a number",
    "cat:s-invalid-position":        "Invalid moves: a position parameter is out of range",
    "cat:s-unsupported-move":        "Invalid moves: one or more unknown or unsupported moves",
    "cat:s-invalid-moves":           "One or more of the specified moves are invalid",
    "cat:s-unknown":                 "Unknown error while processing a submitMoves command",

    "cat:n-num-params":              "The setNft command requires a different number of parameters",
    "cat:n-nonnumeric-token-id":     "The supplied token ID is not a valid integer",
    "cat:n-negative-token-id":       "The supplied token ID is negative",
    "cat:n-unknown":                 "Unknown error while processing a setNft command",
};
*/

export const enum CatapultRejectionCode {
    // generic errors:
    INVALID_COMMAND = GenericRejectionCode.INVALID_GAME_INPUT + 1,

    // createLobby errors:
    C_NUM_PARAMS,
    C_NONNUMERIC_ARGS,
    C_NUM_LIVES,
    C_GRID_SIZE,
    C_NUM_ROUNDS,
    C_ROUND_LENGTH,
    C_HIDDEN,
    C_MAP,
    C_ANIMAL,
    C_PRACTICE,
    C_UNKNOWN,

    // joinLobby errors:
    J_NUM_PARAMS,
    J_INVALID_LOBBY_ID,
    J_NONEXISTENT_LOBBY,
    J_LOBBY_NOT_OPEN,
    J_PLAYER_CREATED_LOBBY,
    J_ANIMAL,
    J_UNKNOWN,

    // submitMoves errors:
    S_NUM_PARAMS,
    S_INVALID_LOBBY_ID,
    S_NONNUMERIC_ROUND_NUMBER,
    S_NONEXISTENT_LOBBY,
    S_LOBBY_NOT_ACTIVE,
    S_WRONG_ROUND,
    S_PLAYER_NOT_IN_LOBBY,
    S_REPEATED_SUBMIT,
    S_TAUNT_PARAM,
    S_NONNUMERIC_POSITION,
    S_INVALID_POSITION,
    S_UNSUPPORTED_MOVE,
    S_INVALID_MOVES,
    S_UNKNOWN,

    // setNft errors:
    N_NUM_PARAMS,
    N_NONNUMERIC_TOKEN_ID,
    N_NEGATIVE_TOKEN_ID,
    N_UNKNOWN,

    // closeLobby errors:
    CS_NUM_PARAMS,
    CS_INVALID_LOBBY_ID,
    CS_NONEXISTENT_LOBBY,
    CS_LOBBY_NOT_OPEN,
    CS_PLAYER_DIDNT_CREATE_LOBBY,
    CS_UNKNOWN,
}

//export type RejectionCode = GenericRejectionCode | CatapultRejectionCode;
