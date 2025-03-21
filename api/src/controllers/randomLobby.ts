import { Controller, Get, Route } from 'tsoa';
import type { IGetRandomLobbyResult } from '@tower-defense/db';
import { requirePool, getRandomLobby, getPaginatedOpenLobbies } from '@tower-defense/db';

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
      { wallet: '', count: '1', page: '0' },
      pool
    );
    const result = backupLobby || null;
    return { lobby: result };
  }
}
