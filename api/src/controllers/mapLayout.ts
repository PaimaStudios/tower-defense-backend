import { getMapLayout, requirePool } from '@tower-defense/db';
import { Body, Controller, Get, Path, Post, Query, Route, SuccessResponse } from 'tsoa';

interface MapLayoutResponse {
  map_layout: string;
}
@Route('map_layout')
export class MapLayoutController extends Controller {
  @Get()
  public async get(@Query() mapName: string): Promise<MapLayoutResponse | {}> {
    const pool = requirePool();
    const [mapString] = await getMapLayout.run({ name: mapName }, pool);
    if (!mapString) return {};
    return {
      map_layout: mapString,
    };
  }
}
