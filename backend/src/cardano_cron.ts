// Sloppy background job to compensate.

import { requirePool, setCardanoGenesisTrainer } from "@tower-defense/db";

export async function cardanoCronJob() {
  const pool = requirePool();

  for (let i = 8675; i <= 9000; i++) {
    const token_id = i.toString();
    const assetName = `47656e6573697320547261696e65722023${token_id.charCodeAt(0).toString(16)}${token_id.charCodeAt(1).toString(16)}${token_id.charCodeAt(2).toString(16)}${token_id.charCodeAt(3).toString(16)}`;

    try {
      const result = await fetch(
        `https://api.koios.rest/api/v1/asset_nft_address?_asset_policy=5863348a43603dc32f2869e2418ced34d01deb5a36154488caedcf07&_asset_name=${assetName}`,
        {
          method: 'GET',
          headers: {
            accept: 'application/json',
          },
        }
      );
      const data: { payment_address: string }[] = await result.json();
      const wallet = data[0].payment_address;

      console.log(token_id, wallet);
      await setCardanoGenesisTrainer.run({ token_id: i, owner: wallet }, pool);

      await new Promise(r => setTimeout(r, 200));
    } catch (e) {
      console.error(e);
      await new Promise(r => setTimeout(r, 1000));
    }
  }
}
