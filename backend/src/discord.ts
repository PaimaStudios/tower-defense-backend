import { doLog } from '@paima/utils';
import { role_setting } from '@tower-defense/db';
import { GameENV } from '@tower-defense/utils';

function nickname(wallet: string): string {
  // TODO: clone logic from frontend
  return wallet;
}

function username(wallet: string, nft: number): string {
  if (nft && GameENV.DISCORD_NFT_EMOJI) {
    return `${nickname(wallet)} ${GameENV.DISCORD_NFT_EMOJI}`;
  } else {
    return nickname(wallet);
  }
}

export async function onLobbyLfg(params: {
  lobby_id: string,
  lobby_creator: string,
  lobby_creator_token_id: number,
  num_of_rounds: number,
  round_length_seconds: number,
  creator_faction: role_setting,
  map: string,
}) {
  /*
  WATERLOGGED PAPAYA :genesistrainer: is looking for a game!
  Rounds: 10 | Round time: 30m | Map: Wavy
  You will play: Random
  https://join.example/ekblajfrklwj
  */
  try {
    // Big try-catch to allow state machine to proceed even if Discord is down.
    if (!GameENV.DISCORD_WEBHOOK_URL) {
      return;
    }

    var url = new URL(GameENV.DISCORD_WEBHOOK_URL);
    url.searchParams.set('wait', 'true');

    const opponent_faction = {
      'attacker': 'Defender',
      'defender': 'Attacker',
      'random': 'Random',
    }[params.creator_faction];

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify({
        content: `\
          ${username(params.lobby_creator, params.lobby_creator_token_id)} is looking for a game!\n\
          Rounds: ${params.num_of_rounds} | Round time: ${params.round_length_seconds / 60}m | Map: ${params.map}\n\
          You would play: ${opponent_faction}\n\
          https://join.example/${params.lobby_id}\n\
        `
      }),
    });

    const message: { id: string } = await response.json();
    doLog('[discord] posted', message.id);
  } catch (e) {
    doLog('[discord] onLobbyLfg error:', e);
  }
}

export async function onLobbyStart() {
  /*
  WATERLOGGED PAPAYA :genesistrainer: is defending against DRINKABLE BUCKBEAN
  Rounds: 10 | Round time: 30m | Map: Wavy
  */
}

export async function onLobbyFinish() {
  /*
  DRINKABLE BUCKBEAN won against WATERLOGGED PAPAYA :genesistrainer:!
  Rounds: 10 | Round time: 30m | Map: Wavy
  */
}

export async function onLobbyAbort() {
  // delete LFG message if lobby expires
}
