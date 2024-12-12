-- like nft_score but partitioned by week
CREATE TABLE nft_score_week(
  -- like cde_erc721_data
  cde_name TEXT NOT NULL,
  token_id TEXT NOT NULL,
  week TEXT NOT NULL, -- ex: '2024w50'
  -- the real NFT state
  wins INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  UNIQUE (cde_name, token_id)
);
