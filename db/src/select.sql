/*  Blockheight queries  */

/* @name getBlockHeight */
SELECT * FROM paima_blocks
WHERE block_height = :block_height;

/* @name getLatestBlockHeight */
SELECT * FROM paima_blocks
ORDER BY block_height DESC
LIMIT 1;

/* @name getLatestProcessedBlockHeight */
SELECT * FROM paima_blocks
WHERE paima_block_hash IS NOT NULL
ORDER BY block_height DESC
LIMIT 1;

/* @name getMatchSeeds */
SELECT * FROM rounds
INNER JOIN paima_blocks
ON paima_blocks.block_height = rounds.execution_block_height
WHERE rounds.lobby_id = :lobby_id;

/*  Rounds  */

/* @name getRoundData */
SELECT * FROM rounds
WHERE lobby_id = :lobby_id!
AND round_within_match = :round_number;

/* @name getLatestRoundByMatchID */
SELECT
rounds.id,
rounds.lobby_id,
rounds.round_within_match,
lobbies.num_of_rounds AS final_round,
lobbies.lobby_creator,
lobbies.player_two,
paima_blocks.block_height AS starting_block_height
FROM rounds
INNER JOIN paima_blocks
ON rounds.starting_block_height = paima_blocks.block_height
INNER JOIN lobbies
ON lobbies.lobby_id = rounds.lobby_id
WHERE rounds.lobby_id = :lobby_id!
ORDER BY rounds.id DESC
LIMIT 1;

/* @name getAllUnexecutedRounds */
SELECT
rounds.id,
rounds.lobby_id,
rounds.round_within_match,
lobbies.num_of_rounds AS final_round,
paima_blocks.block_height AS starting_block_height
FROM rounds
INNER JOIN paima_blocks
ON rounds.starting_block_height = paima_blocks.block_height
INNER JOIN lobbies
ON lobbies.lobby_id = rounds.lobby_id
WHERE execution_block_height IS NULL;

/*  Stats  */

/* @name getUserStats */
SELECT * FROM global_user_state
WHERE wallet = :wallet;

/* @name getMatchUserStats */
SELECT * FROM global_user_state
INNER JOIN lobbies
ON lobbies.lobby_creator = global_user_state.wallet
OR lobbies.player_two = global_user_state.wallet
WHERE global_user_state.wallet = :wallet1;

/* @name getBothUserStats */
SELECT global_user_state.wallet, wins, losses
FROM global_user_state
WHERE global_user_state.wallet = :wallet
OR global_user_state.wallet = :wallet2;

/*  NFTs  */

/* @name getUserNFTs */
SELECT * FROM nfts
WHERE wallet = :wallet;

/* @name getLatestUserNft */
SELECT * FROM nfts
WHERE wallet = :wallet
ORDER BY block_height DESC
LIMIT 1;

/*  Maps  */

/* @name getMapLayout */
SELECT * FROM maps
WHERE name = :name!;

/* for testing */

/* @name getAllMaps */
SELECT * FROM maps;

/*  Configs  */

/* @name getMatchConfig */
SELECT * FROM configs
WHERE id = :id;

/*  Lobbies  */

/* @name getPaginatedOpenLobbies */
SELECT * FROM lobbies
INNER JOIN global_user_state
ON lobbies.lobby_creator = global_user_state.wallet
WHERE lobbies.lobby_state = 'open' AND lobbies.hidden IS FALSE AND lobbies.lobby_creator != :wallet
ORDER BY created_at DESC
LIMIT :count
OFFSET :page;

/* @name searchPaginatedOpenLobbies */
SELECT * FROM lobbies
WHERE lobbies.lobby_state = 'open' AND lobbies.hidden IS FALSE AND lobbies.lobby_creator != :wallet AND lobbies.lobby_id LIKE :searchQuery
ORDER BY created_at DESC
LIMIT :count
OFFSET :page;

/* @name getOpenLobbyById */
SELECT * FROM lobbies
WHERE lobbies.lobby_state = 'open' AND lobbies.lobby_id = :searchQuery AND lobbies.lobby_creator != :wallet;

/* @name getRandomLobby */
SELECT *
FROM lobbies
WHERE random() < 0.1
AND lobbies.lobby_state = 'open' AND lobbies.hidden is FALSE
LIMIT 1;

/* @name getRandomActiveLobby */
SELECT * FROM lobbies
WHERE random() < 0.1
AND lobbies.lobby_state = 'active'
LIMIT 1;

/* @name getUserFinishedLobbies */
SELECT * FROM lobbies
WHERE lobbies.lobby_state = 'finished'
AND (lobbies.lobby_creator = :wallet
OR lobbies.player_two = :wallet)
ORDER BY created_at DESC
LIMIT :count
OFFSET :page;

/* @name getUserLobbies */
SELECT * FROM lobbies
WHERE lobbies.lobby_state != 'finished'
AND lobbies.lobby_state != 'closed'
AND (lobbies.lobby_creator = :wallet
OR lobbies.player_two = :wallet)
ORDER BY created_at DESC;

/* @name getPaginatedUserLobbies */
SELECT * FROM lobbies
WHERE lobbies.lobby_state != 'finished'
AND lobbies.lobby_state != 'closed'
AND (lobbies.lobby_creator = :wallet
OR lobbies.player_two = :wallet)
ORDER BY created_at DESC
LIMIT :count
OFFSET :page;

/* @name getActiveLobbies */
SELECT * FROM lobbies
WHERE lobbies.lobby_state = 'active';

/* @name getLobbyById */
SELECT * FROM lobbies
WHERE lobby_id = :lobby_id;

/* @name getNewLobbiesByUserAndBlockHeight */
SELECT lobby_id FROM lobbies
WHERE lobby_creator = :wallet
AND creation_block_height = :block_height;

/* @name getCurrentMatchState */
SELECT current_match_state FROM lobbies
WHERE lobby_id = :lobby_id;

/* @name getLobbyStatus */
SELECT lobby_state FROM lobbies
WHERE lobby_id = :lobby_id;

/*  Moves  */

/* @name getRoundMoves */
SELECT * FROM match_moves
WHERE lobby_id = :lobby_id!
AND   round = :round!;

/* @name getCachedMoves */
SELECT
  match_moves.id,
  match_moves.lobby_id,
  move_type,
  move_target,
  round,
  wallet
FROM match_moves
INNER JOIN rounds
ON match_moves.lobby_id = rounds.lobby_id
AND match_moves.round = rounds.round_within_match
WHERE rounds.execution_block_height IS NULL
AND match_moves.lobby_id = :lobby_id;

/* @name getMovesByLobby */
SELECT *
FROM match_moves
WHERE match_moves.lobby_id = :lobby_id;

/* Final Match State */

/* @name getFinalState */
SELECT * FROM final_match_state
WHERE lobby_id = :lobby_id;

/* @name getUserConfigs */
SELECT * FROM configs
WHERE creator = :creator;

/* @name getAllConfigs */
SELECT * FROM configs;

/* @name getOldLobbies */
SELECT * FROM lobbies
WHERE lobby_state = 'finished'
AND created_at < :date;

/* @name getLastScheduledWiping */
SELECT future_block_height AS block_height FROM rollup_inputs
LEFT JOIN rollup_input_future_block ON rollup_input_future_block.id = rollup_inputs.id
LEFT JOIN rollup_input_origin ON rollup_input_future_block.id = rollup_inputs.id
WHERE contract_address = :precompile
ORDER BY future_block_height DESC LIMIT 1;
