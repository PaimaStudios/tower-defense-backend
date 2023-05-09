export function queryLobbyState(backendUri: string, lobbyID: string): string {
    return `${backendUri}/lobby_state?lobbyID=${lobbyID}`;
}

export function queryRoundStatus(backendUri: string, lobbyID: string, round: number): string {
    return `${backendUri}/round_status?lobbyID=${lobbyID}&round=${round}`;
}