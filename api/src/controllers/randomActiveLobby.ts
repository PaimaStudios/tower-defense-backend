import { Controller, Get, Route } from 'tsoa';
import { requirePool } from '@tower-defense/db';
import { getRandomActiveLobby, IGetRandomActiveLobbyResult } from './mockDB';

interface RandomActiveLobbyResponse {
  lobby: IGetRandomActiveLobbyResult | null;
}

@Route('random_active_lobby')
export class RandomActiveLobbyController extends Controller {
  @Get()
  public async get(): Promise<RandomActiveLobbyResponse> {
    const pool = requirePool();
    const [lobby] = await getRandomActiveLobby.run(undefined, pool);
    const result = lobby || null;
    return { lobby: result };
  }
}
