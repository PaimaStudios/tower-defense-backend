export function queryLobbyState(backendUri: string, lobbyID: string): string {
    return `${backendUri}/lobby_state?lobbyID=${lobbyID}`;
}