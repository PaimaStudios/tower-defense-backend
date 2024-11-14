/* @name getNewLobbiesForDiscord */
SELECT
  lobbies.lobby_id, lobby_creator, lobby_creator_token_id, num_of_rounds,
  round_length, creator_faction, map, lobbies.lobby_state, lobbies.current_round,
  discord_message_id
FROM
  lobbies
  LEFT JOIN discord_lobbies ON lobbies.lobby_id = discord_lobbies.lobby_id
WHERE
  -- Exclude private and vs-bot lobbies
  NOT hidden
  AND NOT practice
  AND (
    -- Permit unposted lobbies
    discord_message_id IS NULL
    OR (
      -- Permit posted lobbies whose state has changed
      discord_message_id != ''
      AND (
        lobbies.current_round != discord_lobbies.current_round
        OR lobbies.lobby_state != discord_lobbies.lobby_state
      )
    )
  );

/* @name setLobbyForDiscord */
INSERT INTO discord_lobbies (lobby_id, lobby_state, current_round, discord_message_id)
VALUES (:lobby_id!, :lobby_state!, :current_round!, :discord_message_id!)
ON CONFLICT (lobby_id)
DO UPDATE SET
  lobby_state = EXCLUDED.lobby_state,
  current_round = EXCLUDED.current_round,
  discord_message_id = EXCLUDED.discord_message_id;
