import { Controller, Get, Query, Route } from 'tsoa';
import { requirePool, getLobbyById, getRoundData, getMatchConfig } from '@tower-defense/db';
import { parseConfig } from '@tower-defense/game-logic';
import { MatchConfig } from '@tower-defense/utils';
type Response = Config | Error;

interface Config {
  config: MatchConfig;
}

interface Error {
  error: 'config not found' | 'lobby not found';
}

@Route('config')
export class configController extends Controller {
  @Get()
  public async get(@Query() lobbyID: string): Promise<Response> {
    const pool = requirePool();
    const [lobby] = await getLobbyById.run({ lobby_id: lobbyID }, pool);
    if (!lobby) return { error: 'lobby not found' };
    const [configString] = await getMatchConfig.run({ id: lobby.config_id }, pool);
    if (!configString) return { error: 'config not found' };
    const config = parseConfig(configString.content);
    return { config };
  }
}
