import { Controller, Get, Route } from 'tsoa';
import { requirePool } from '@tower-defense/db';
import { getPaginatedOpenLobbies, getRandomLobby, IGetRandomLobbyResult } from './mockDB';

interface RandomLobbyResponse {
  lobby: IGetRandomLobbyResult | null;
}

@Route('random_lobby')
export class RandomLobbyController extends Controller {
  @Get()
  public async get(): Promise<RandomLobbyResponse> {
    const pool = requirePool();
    const [lobby] = await getRandomLobby.run(undefined, pool);
    if (lobby) {
      return { lobby };
    }

    const [backupLobby] = await getPaginatedOpenLobbies.run(
      { wallet: '', count: `1`, page: `1` },
      pool
    );
    const result = backupLobby || null;
    return { lobby: result };
  }
}
