import { Body, Controller, Get, Path, Post, Query, Route, SuccessResponse } from 'tsoa';
import { requirePool, getLobbyById, getFinalState, IGetFinalStateResult } from '@tower-defense/db';
import { LobbyStatus } from '@tower-defense/utils';

interface MatchWinnerResponse {
  match_status: LobbyStatus;
  winner_address: string;
}
const getWinner = (finalState: IGetFinalStateResult): string => {
    switch (finalState.player_one_result) {
        case "win":
            return finalState.player_one_wallet;
        case "loss":
            return finalState.player_two_wallet;
    }
}

@Route('match_winner')
export class MatchWinnerController extends Controller {
    @Get()
    public async get(@Query() lobbyID: string): Promise<MatchWinnerResponse | {}> {
        const pool = requirePool();
        const [lobby] = await getLobbyById.run({ lobby_id: lobbyID }, pool);
        if (!lobby) return {};

        if (lobby.lobby_state !== "finished") {
            return {
                match_status: lobby.lobby_state,
                winner_address: ""
            };
        }

        const [finalState] = await getFinalState.run({ lobby_id: lobbyID }, pool);
        if (!finalState) return {};

        return {
            match_status: "finished",
            winner_address: getWinner(finalState)
        };
    }
}
