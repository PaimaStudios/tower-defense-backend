import { Pool } from 'pg';

import { LobbyDbQuery, LobbyWebserverQuery } from '@tower-defense/utils';
import { getLatestUserNft } from './controllers/mockDB';

async function addCreatorNft(lobby: LobbyDbQuery, pool: Pool): Promise<LobbyWebserverQuery> {
  const wallet = lobby.lobby_creator;
  const [nft] = await getLatestUserNft.run({ wallet }, pool);
  if (nft) {
    return {
      lobby,
      nft: {
        wallet,
        nftContract: nft.address,
        tokenId: nft.token_id,
      },
    };
  }

  return {
    lobby,
    nft: {
      wallet,
      nftContract: null,
      tokenId: null,
    },
  };
}

export async function addCreatorNfts(
  lobbies: LobbyDbQuery[],
  pool: Pool
): Promise<LobbyWebserverQuery[]> {
  return Promise.all(lobbies.map(lobby => addCreatorNft(lobby, pool)));
}
