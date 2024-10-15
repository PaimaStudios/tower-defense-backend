import { Controller, Get, Route } from 'tsoa';
import { gameBackendVersion } from '@tower-defense/utils';

@Route('backend_version')
export class VersionController extends Controller {
  @Get()
  public async get(): Promise<string> {
    return gameBackendVersion;
  }
}
