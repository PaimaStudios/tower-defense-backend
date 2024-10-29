import { mkdir, open } from 'fs/promises';
import { pipeline } from 'stream/promises';
import { Controller, Get, Produces, Route } from 'tsoa';

const ipfsGateway = 'https://nftstorage.link/ipfs';
const ipfsFolder = 'bafybeifmess2bo2tt6joxtxyzjael3w537kn7sd4jrp4phbi6ozrb2jxu4';

const storageFolder = 'build/trainer-image';

@Route('trainer-image')
export class TrainerImageController extends Controller {
  @Get('{tokenId}.png')
  @Produces('image/png')
  public async get(@Route() tokenId: number): Promise<object> {
    // In theory, we would want to talk to the contract to learn the base URL.
    // Hardcode it for now because w/e, it's fine.
    const filename = `${storageFolder}/${tokenId}.png`;

    try {
      const file = await open(filename, 'r');
      return file.createReadStream();
    } catch {
      // Couldn't read from cache, so write to cache instead.
      const url = `${ipfsGateway}/${ipfsFolder}/${tokenId}.png`;
      const dl = await fetch(url);
      if (!dl.ok) {
        throw new Error(`${dl.status} ${dl.statusText}`);
      } else if (!dl.body) {
        throw new Error('Empty response');
      }

      await mkdir(storageFolder, { recursive: true });
      const file = await open(filename, 'w+');
      await pipeline(dl.body, file.createWriteStream({ autoClose: false }), { end: false });
      return file.createReadStream({ start: 0 });
    }
  }
}
