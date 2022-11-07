import { buildEndpointErrorFxn } from "../errors";
import { getDeployment } from "../state";
import { getBlockTime } from "./general";
export function batchedToJsonString(b) {
    return JSON.stringify({
        user_address: b.userAddress,
        user_signature: b.userSignature,
        game_input: b.gameInput,
        timestamp: b.millisecondTimestamp,
    });
}
export function batchedToString(b) {
    return [
        b.userAddress,
        b.userSignature,
        b.gameInput,
        b.millisecondTimestamp,
    ].join("/");
}
export function moveToString(move) {
    switch (move.moveType) {
        case "fire":
            return "f" + move.position.toString(10);
        case "reposition":
            return "r" + move.position.toString(10);
        case "taunt":
            return "t";
        default:
            console.log("[moveToString] found move with invalid type:", move);
            throw new Error(`Invalid move submitted: ${move}`);
    }
}
export function nftToStrings(nft) {
    return [nft.title, nft.imageUrl, nft.nftAddress, `${nft.tokenId}`];
}
export function userJoinedLobby(address, lobby) {
    if (!lobby.hasOwnProperty("lobby")) {
        return false;
    }
    const l = lobby.lobby;
    if (!l.hasOwnProperty("player_two")) {
        return false;
    }
    if (!l.player_two || !address) {
        return false;
    }
    return l.player_two.toLowerCase() === address.toLowerCase();
}
export function userCreatedLobby(address, lobby) {
    if (!lobby.hasOwnProperty("lobby")) {
        return false;
    }
    const l = lobby.lobby;
    if (!l.hasOwnProperty("lobby_creator")) {
        return false;
    }
    if (!l.lobby_creator || !address) {
        return false;
    }
    return l.lobby_creator.toLowerCase() === address.toLowerCase();
}
export async function buildBatchedSubunit(signFunction, userAddress, gameInput) {
    const millisecondTimestamp = new Date().getTime().toString(10);
    const message = gameInput + millisecondTimestamp;
    const userSignature = await signFunction(userAddress, message);
    return {
        userAddress,
        userSignature,
        gameInput,
        millisecondTimestamp,
    };
}
export function calculateRoundEnd(roundStart, roundLength, current) {
    const errorFxn = buildEndpointErrorFxn("calculateRoundEnd");
    let roundEnd = roundStart + roundLength;
    if (roundEnd < current) {
        errorFxn(19 /* CatapultMiddlewareErrorCode.CALCULATED_ROUND_END_IN_PAST */);
        roundEnd = current;
    }
    try {
        const blocksToEnd = roundEnd - current;
        const secsPerBlock = getBlockTime(getDeployment());
        const secondsToEnd = blocksToEnd * secsPerBlock;
        return {
            blocks: blocksToEnd,
            seconds: secondsToEnd,
        };
    }
    catch (err) {
        const { message } = errorFxn(32 /* CatapultMiddlewareErrorCode.INTERNAL_INVALID_DEPLOYMENT */, err);
        throw new Error(message);
    }
}
