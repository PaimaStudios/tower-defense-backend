function queryValueToString(value) {
    if (typeof value === "string") {
        return value;
    }
    else if (typeof value === "number") {
        return value.toString(10);
    }
    else if (typeof value === "boolean") {
        return value.toString();
    }
    else {
        throw new Error("[queryValueToString] Invalid query value");
    }
}
function buildQuery(endpoint, options) {
    const optStrings = [];
    for (let opt in options) {
        const valString = queryValueToString(options[opt]);
        optStrings.push(`${opt}=${valString}`);
    }
    if (optStrings.length === 0) {
        return endpoint;
    }
    else {
        return `${endpoint}?${optStrings.join("&")}`;
    }
}
const buildServerQuery = buildQuery;
function buildIndexerQuery(endpoint, options) {
    return "api/v1/" + buildQuery(endpoint, options);
}
export function indexerQueryAccountNfts(account, size, page) {
    const endpoint = "account-nfts";
    let optsStart = {};
    if (typeof size !== "undefined") {
        optsStart.size = size;
    }
    if (typeof page !== "undefined") {
        optsStart.page = page;
    }
    const options = {
        ...optsStart,
        metadata: true,
        traits: false,
        account,
    };
    return buildIndexerQuery(endpoint, options);
}
export function indexerQueryHistoricalOwner(contract, tokenId, blockHeight) {
    const endpoint = "historical-owner";
    const options = {
        contract,
        tokenId,
        blockHeight,
    };
    return buildIndexerQuery(endpoint, options);
}
export function indexerQueryTitleImage(contract, tokenId) {
    const endpoint = "title-image";
    const options = {
        tokenId,
        contract,
    };
    return buildIndexerQuery(endpoint, options);
}
export function backendQueryLobbyState(lobbyID) {
    const endpoint = "lobby_state";
    const options = {
        lobbyID,
    };
    return buildServerQuery(endpoint, options);
}
export function backendQueryLatestProcessedBlockHeight() {
    const endpoint = "latest_processed_blockheight";
    const options = {};
    return buildServerQuery(endpoint, options);
}
export function backendQueryUserLobbiesBlockheight(wallet, blockHeight) {
    const endpoint = "user_lobbies_blockheight";
    const options = {
        wallet,
        block_height: blockHeight,
    };
    return buildServerQuery(endpoint, options);
}
export function backendQueryRoundStatus(lobbyID, roundNumber) {
    const endpoint = "round_status";
    const options = {
        lobbyID,
        roundNumber,
    };
    return buildServerQuery(endpoint, options);
}
export function backendQueryUserStats(wallet) {
    const endpoint = "user_stats";
    const options = {
        wallet,
    };
    return buildServerQuery(endpoint, options);
}
export function backendQueryUserNft(wallet) {
    const endpoint = "user_nft";
    const options = {
        wallet,
    };
    return buildServerQuery(endpoint, options);
}
export function backendQueryUserLobbies(wallet, count, page) {
    const endpoint = "user_lobbies";
    let optsStart = {};
    if (typeof count !== "undefined") {
        optsStart.count = count;
    }
    if (typeof page !== "undefined") {
        optsStart.page = page;
    }
    const options = {
        wallet,
        ...optsStart,
    };
    return buildServerQuery(endpoint, options);
}
export function backendQueryOpenLobbies(count, page) {
    const endpoint = "open_lobbies";
    let optsStart = {};
    if (typeof count !== "undefined") {
        optsStart.count = count;
    }
    if (typeof page !== "undefined") {
        optsStart.page = page;
    }
    const options = {
        ...optsStart,
    };
    return buildServerQuery(endpoint, options);
}
export function backendQueryRoundExecutor(lobbyID, roundNumber) {
    const endpoint = "round_executor";
    const options = {
        lobbyID,
        roundNumber,
    };
    return buildServerQuery(endpoint, options);
}
export function backendQueryMatchExecutor(lobbyID) {
    const endpoint = "match_executor";
    const options = {
        lobbyID,
    };
    return buildServerQuery(endpoint, options);
}
