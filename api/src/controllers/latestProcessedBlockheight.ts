import { Controller, Get, Route } from 'tsoa';
import { requirePool } from '@tower-defense/db';
import { getLatestProcessedBlockHeight } from './mockDB';

interface Response {
  block_height?: number;
}

@Route('latest_processed_blockheight')
export class latestProcessedBlockheightController extends Controller {
  @Get()
  public async get(): Promise<Response> {
    const pool = requirePool();
    const [b] = await getLatestProcessedBlockHeight.run(undefined, pool);
    if (!b) {
      return {};
    }
    return { block_height: b.block_height };
  }
}
