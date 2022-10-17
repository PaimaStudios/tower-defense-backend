import { gameBackendVersion } from "td-utils";

import { buildEndpointErrorFxn, CatapultMiddlewareErrorCode } from "../errors";
import {
    FailedResult,
    LobbyState,
    NewLobbies,
    NewLobby,
    PackedLobbyState,
    SuccessfulResult,
} from "../types";
import { userCreatedLobby, userJoinedLobby } from "./data-processing";
import {
    backendQueryLatestProcessedBlockHeight,
    backendQueryLobbyState,
    backendQueryUserLobbiesBlockheight,
} from "./query-constructors";
import {
    backendEndpointCall,
    backendTextEndpointCall,
} from "./server-interaction";

export async function getRawLobbyState(
    lobbyID: string
): Promise<PackedLobbyState | FailedResult> {
    const errorFxn = buildEndpointErrorFxn("getRawLobbyState");
    try {
        const query = backendQueryLobbyState(lobbyID);
        const result = await backendEndpointCall(query);
        if (!result.success) {
            return errorFxn(
                CatapultMiddlewareErrorCode.ERROR_QUERYING_BACKEND_ENDPOINT
            );
        }
        const j = result.result as { lobby: LobbyState };
        if (typeof j !== "object" || j === null || !j.hasOwnProperty("lobby")) {
            return errorFxn(
                CatapultMiddlewareErrorCode.INVALID_RESPONSE_FROM_BACKEND
            );
        }
        // TODO: check if j.lobby has all required properties?
        return {
            success: true,
            lobby: j.lobby,
        };
    } catch (err) {
        return errorFxn(
            CatapultMiddlewareErrorCode.ERROR_QUERYING_BACKEND_ENDPOINT,
            err
        );
    }
}

export async function getRawLatestProcessedBlockHeight(): Promise<
    SuccessfulResult<number> | FailedResult
> {
    const errorFxn = buildEndpointErrorFxn("getRawLatestProcessedBlockHeight");
    try {
        const query = backendQueryLatestProcessedBlockHeight();
        const result = await backendEndpointCall(query);
        if (!result.success) {
            return errorFxn(
                CatapultMiddlewareErrorCode.ERROR_QUERYING_BACKEND_ENDPOINT
            );
        }
        const j = result.result as { block_height: number };
        if (
            typeof j !== "object" ||
            j === null ||
            !j.hasOwnProperty("block_height")
        ) {
            return errorFxn(
                CatapultMiddlewareErrorCode.INVALID_RESPONSE_FROM_BACKEND
            );
        }
        return {
            success: true,
            result: j.block_height,
        };
    } catch (err) {
        return errorFxn(
            CatapultMiddlewareErrorCode.ERROR_QUERYING_BACKEND_ENDPOINT,
            err
        );
    }
}

export async function getRawNewLobbies(
    wallet: string,
    blockHeight: number
): Promise<NewLobbies | FailedResult> {
    const errorFxn = buildEndpointErrorFxn("getRawNewLobbies");
    try {
        const query = backendQueryUserLobbiesBlockheight(wallet, blockHeight);
        const result = await backendEndpointCall(query);
        if (!result.success) {
            return errorFxn(
                CatapultMiddlewareErrorCode.ERROR_QUERYING_BACKEND_ENDPOINT
            );
        }
        const j = result.result as { lobbies: NewLobby[] };
        if (
            typeof j !== "object" ||
            j === null ||
            !j.hasOwnProperty("lobbies")
        ) {
            return errorFxn(
                CatapultMiddlewareErrorCode.INVALID_RESPONSE_FROM_BACKEND
            );
        }
        // TODO: check NewLobby props?
        return {
            success: true,
            ...j,
        };
    } catch (err) {
        return errorFxn(
            CatapultMiddlewareErrorCode.ERROR_QUERYING_BACKEND_ENDPOINT,
            err
        );
    }
}

// TODO: reworking this to use serverEndpointCall requires the endpoint to return a JSON
//       also purposefully not using a query constructor for extra differentiation
export async function getRemoteBackendVersion(): Promise<string> {
    const result = await backendTextEndpointCall("backend_version");
    if (!result.success) {
        throw new Error(
            "Error while querying version string: " + result.message
        );
    }
    const versionString = result.result;
    if (
        versionString[0] !== '"' ||
        versionString[versionString.length - 1] !== '"'
    ) {
        throw new Error("Invalid version string: " + versionString);
    }
    return versionString.slice(1, versionString.length - 1);
}

export async function getNonemptyNewLobbies(
    address: string,
    blockHeight: number
): Promise<NewLobbies> {
    return new Promise(async (res, err) => {
        const newLobbies = await getRawNewLobbies(address, blockHeight);
        if (!newLobbies.success) {
            err("Failed to get new lobbies");
        } else if (newLobbies.lobbies.length === 0) {
            err("Received an empty list of new lobbies");
        } else {
            res(newLobbies);
        }
    });
}

export async function getNonemptyRandomOpenLobby(): Promise<PackedLobbyState> {
    return new Promise(async (res, err) => {
        return backendEndpointCall("random_lobby").then(result => {
            if (!result.success) {
                err("Random lobby retrieval unsuccessful");
                return;
            }
            // TODO: verify?
            const j: { lobby: LobbyState } = result.result as { lobby: LobbyState };
            if (j.hasOwnProperty("lobby")) {
                res({
                    success: true,
                    ...j
                });
            } else {
                err("Received an empty object instead of a random lobby");
            }
        });
    });
}

export async function getLobbyStateWithUser(
    lobbyID: string,
    address: string
): Promise<PackedLobbyState> {
    return new Promise((res, err) => {
        try {
            return getRawLobbyState(lobbyID).then(lobbyState => {
                if (!lobbyState.success) {
                    err("Failed to get lobby state");
                } else if (
                    userJoinedLobby(address, lobbyState) ||
                    userCreatedLobby(address, lobbyState)
                ) {
                    res(lobbyState);
                } else {
                    err("User is not in the lobby");
                }
            });
        } catch (e) {
            err(e);
        }
    });
}

// Waits until awaitedBlock has been processed by the backend
export async function awaitBlock(awaitedBlock: number): Promise<void> {
    const BLOCK_DELAY = 5000;
    let currentBlock: number;

    function waitLoop() {
        setTimeout(async () => {
            const res = await getRawLatestProcessedBlockHeight();
            if (res.success) {
                currentBlock = res.result;
            }
            if (!res.success || currentBlock < awaitedBlock) {
                waitLoop();
            }
        }, BLOCK_DELAY);
    }

    waitLoop();
}

export async function localRemoteVersionsCompatible(): Promise<boolean> {
    const localVersion = gameBackendVersion;
    const remoteVersion = await getRemoteBackendVersion();

    const localComponents = localVersion.split(".").map(parseInt);
    const remoteComponents = remoteVersion.split(".").map(parseInt);

    console.log("Middleware version:", localVersion);
    console.log("Backend version:   ", remoteVersion);

    if (localComponents[0] !== remoteComponents[0]) {
        return false;
    } else {
        return true;
    }
}
