ALTER TABLE nft_score
  ADD streak INTEGER NOT NULL DEFAULT 0,
  ADD best_streak INTEGER NOT NULL DEFAULT 0;

CREATE TABLE discord_lobbies(
  -- PK
  lobby_id TEXT PRIMARY KEY,
  -- Tracking lobby state to know when we should update the message later
  lobby_state lobby_status NOT NULL DEFAULT 'open',
  current_round INTEGER NOT NULL DEFAULT 0,
  -- Tracking Discord state to know if we've posted a message yet
  -- NULL means never posted, '' means deleted or declined to post
  discord_message_id TEXT
);
