import { run } from '@paima/runtime/build/run-flag.js';
import { doLog, ENV } from '@paima/utils';
import { requirePool } from '@tower-defense/db';
import {
  getNewLobbiesForDiscord,
  IGetNewLobbiesForDiscordResult,
  setLobbyForDiscord,
} from '@tower-defense/db/build/discord.queries.js';
import { GameENV, MatchState } from '@tower-defense/utils';
import { generateNameFromString } from './name_generator.js';

// ----------------------------------------------------------------------------

async function createMessage(body: { content: string }): Promise<string> {
  if (!GameENV.DISCORD_WEBHOOK_URL || !body.content) {
    return '';
  }
  var url = new URL(GameENV.DISCORD_WEBHOOK_URL);
  url.searchParams.set('wait', 'true');
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const message: { id: string } = await response.json();
  return message.id;
}

async function editMessage(id: string, body: { content: string }) {
  if (!GameENV.DISCORD_WEBHOOK_URL || !body.content) {
    return '';
  }
  var url = new URL(GameENV.DISCORD_WEBHOOK_URL);
  url.pathname = `${url.pathname}/messages/${id}`;
  await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

async function deleteMessage(id: string) {
  if (!GameENV.DISCORD_WEBHOOK_URL) {
    return '';
  }
  var url = new URL(GameENV.DISCORD_WEBHOOK_URL);
  url.pathname = `${url.pathname}/messages/${id}`;
  await fetch(url, {
    method: 'DELETE',
  });
}

async function upsertDiscordMessage(id: string | null, content: string): Promise<string> {
  if (id === '') {
    // We originally declined to post a message ever.
    return id;
  } else if (id === null) {
    // We haven't posted a message yet, so either create it or decline.
    if (content) {
      return await createMessage({ content });
    } else {
      return '';
    }
  } else {
    // We've posted a message, so edit or delete it.
    if (content) {
      await editMessage(id, { content });
      return id;
    } else {
      await deleteMessage(id);
      return '';
    }
  }
}

// ----------------------------------------------------------------------------

function username(wallet: string, nft: number): string {
  if (nft && GameENV.DISCORD_NFT_EMOJI) {
    return `${generateNameFromString(wallet)} ${GameENV.DISCORD_NFT_EMOJI}`;
  } else {
    return generateNameFromString(wallet);
  }
}

function mapName(map: string): string {
  return map.substring(0, 1).toUpperCase() + map.substring(1);
}

// ----------------------------------------------------------------------------

function calculateMessageText(lobby: IGetNewLobbiesForDiscordResult): string {
  switch (lobby.lobby_state) {
    case 'open': {
      /*
      WATERLOGGED PAPAYA :genesistrainer: is looking for a game!
      Map: Wavy | Rounds: 10 | Round time: 30m
      You will play: Random
      https://join.example/ekblajfrklwj
      */
      const round_length_minutes = (lobby.round_length * ENV.BLOCK_TIME) / 60;
      const opponent_faction = {
        attacker: 'Defender',
        defender: 'Attacker',
        random: 'Random',
      }[lobby.creator_faction];
      return `
        *${username(lobby.lobby_creator, lobby.lobby_creator_token_id)}* is looking for a game!
        Map: ${mapName(lobby.map)} | Rounds: ${lobby.num_of_rounds} | Round time: ${round_length_minutes}m
        You would play: ${opponent_faction}
        https://join.example/${lobby.lobby_id}
      `;
    }
    case 'active': {
      /*
      WATERLOGGED PAPAYA :genesistrainer: is defending against DRINKABLE BUCKBEAN
      Map: Wavy | Round: 1/10
      */
      const verb = {
        attacker: 'attacking',
        defender: 'defending against',
        // Not supposed to happen:
        random: 'facing',
      }[lobby.creator_faction];
      const matchState = lobby.current_match_state as unknown as MatchState;
      const playerTwoTokenId =
        lobby.player_two === matchState.attacker
          ? matchState.attackerTokenId
          : matchState.defenderTokenId;
      return `
        *${username(lobby.lobby_creator, lobby.lobby_creator_token_id)}* is ${verb} *${username(lobby.player_two!, playerTwoTokenId)}*!
        Map: ${mapName(lobby.map)} | Round: ${lobby.current_round}/${lobby.num_of_rounds}
      `;
    }
    case 'finished': {
      /*
      WATERLOGGED PAPAYA :genesistrainer: defended against DRINKABLE BUCKBEAN!
      WATERLOGGED PAPAYA :genesistrainer: broke the defenses of DRINKABLE BUCKBEAN!
      WATERLOGGED PAPAYA :genesistrainer: fell to DRINKABLE BUCKBEAN!
      WATERLOGGED PAPAYA :genesistrainer: was repelled by DRINKABLE BUCKBEAN!
      Map: Wavy | Rounds: 7
      */
      const matchState = lobby.current_match_state as unknown as MatchState;
      const defenderWon = matchState.defenderBase.health > 0;
      const outcome = {
        attacker_false: 'broke the defenses of',
        defender_true: 'defended against',
        attacker_true: 'was repelled by',
        defender_false: 'fell to',
        // Not supposed to happen:
        random_true: 'finished playing against',
        random_false: 'finished playing against',
      }[`${lobby.creator_faction}_${defenderWon}`];
      const playerTwoTokenId =
        lobby.player_two === matchState.attacker
          ? matchState.attackerTokenId
          : matchState.defenderTokenId;
      return `
        *${username(lobby.lobby_creator, lobby.lobby_creator_token_id)}* ${outcome} *${username(lobby.player_two!, playerTwoTokenId)}*!
        Map: ${mapName(lobby.map)} | Rounds: ${lobby.current_round}
      `;
    }
    case 'closed':
      return '';
  }
}

export async function discordMain() {
  if (!GameENV.DISCORD_WEBHOOK_URL) {
    doLog('[discord] DISCORD_WEBHOOK_URL not set; not sending Discord messages');
  }

  const pool = requirePool();

  while (run) {
    const newLobbies = await getNewLobbiesForDiscord.run(undefined, pool);
    for (let lobby of newLobbies) {
      try {
        const text = calculateMessageText(lobby).replaceAll(/\n\s*/g, '\n').trim();
        const newId = await upsertDiscordMessage(lobby.discord_message_id, text);
        await setLobbyForDiscord.run({ ...lobby, discord_message_id: newId }, pool);
      } catch (e) {
        doLog('[discord] error handling lobby update', lobby, ':', e);
      }
      // Limit how fast we post to Discord.
      await new Promise(r => setTimeout(r, 1000));
    }
    await new Promise(r => setTimeout(r, 1000));
  }
}
