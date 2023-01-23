/*  Blockheight queries  */ 

/* @name getBlockHeight */
SELECT * FROM block_heights 
WHERE block_height = :block_height;

/* @name getLatestBlockHeight */
SELECT * FROM block_heights 
ORDER BY block_height DESC
LIMIT 1;

/* @name getLatestProcessedBlockHeight */
SELECT * FROM block_heights 
WHERE done IS TRUE
ORDER BY block_height DESC
LIMIT 1;

/* @name getMatchSeeds */
SELECT * FROM rounds
INNER JOIN block_heights
ON block_heights.block_height = rounds.execution_block_height
WHERE rounds.lobby_id = :lobby_id;

/*  Scheduled data  */

/* @name getScheduledDataByBlockHeight */
SELECT * from scheduled_data
WHERE block_height = :block_height!
ORDER BY id ASC;

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
block_heights.block_height AS starting_block_height
FROM rounds
INNER JOIN block_heights 
ON rounds.starting_block_height = block_heights.block_height
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
block_heights.block_height AS starting_block_height
FROM rounds
INNER JOIN block_heights 
ON rounds.starting_block_height = block_heights.block_height
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
SELECT global_user_state.wallet, wins, losses, ties
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

/*  Configs  */

/* @name getMatchConfig */
SELECT * FROM configs
WHERE id = :id;

/*  Lobbies  */

/* @name getPaginatedOpenLobbies */
SELECT * FROM lobbies
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
SELECT
FROM lobbies
WHERE random() < 0.1
AND lobbies.lobby_state = 'open' AND lobbies.hidden is FALSE
LIMIT 1;

/* @name getRandomActiveLobby */
SELECT * FROM lobbies
WHERE random() < 0.1
AND lobbies.lobby_state = 'active'
LIMIT 1;

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
SELECT current_match_state FROM Lobbies
WHERE lobby_id = :lobby_id;

/*  Moves  */

/* @name getRoundMoves */
SELECT * FROM match_moves
WHERE lobby_id = :lobby_id!
AND   round = :round!;

/* @name getCachedMoves */
SELECT * FROM match_moves
INNER JOIN rounds
ON match_moves.lobby_id = rounds.lobby_id
AND match_moves.round = rounds.round_within_match
WHERE rounds.execution_block_height IS NULL
AND match_moves.lobby_id = :lobby_id;

/* @name getMovesByLobby */
SELECT *
FROM match_moves
WHERE match_moves.lobby_id = :lobby_id;