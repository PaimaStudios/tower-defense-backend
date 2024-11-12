/*  Rounds  */

/* @name getMatchSeeds */
SELECT * FROM rounds
INNER JOIN paima_blocks
ON paima_blocks.block_height = rounds.execution_block_height
WHERE rounds.lobby_id = :lobby_id;

/* @name getRoundData */
SELECT * FROM rounds
WHERE lobby_id = :lobby_id!
AND round_within_match = :round_number;

/*  Stats  */

/* @name getUserStats */
SELECT * FROM global_user_state
WHERE wallet = :wallet;

/*  NFTs  */

/* @name getLatestUserNft */
SELECT * FROM nfts
WHERE wallet = :wallet!
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

/* @name getPaginatedUserLobbies */
SELECT * FROM lobbies
WHERE lobbies.lobby_state != 'finished'
AND lobbies.lobby_state != 'closed'
AND (lobbies.lobby_creator = :wallet
OR lobbies.player_two = :wallet)
ORDER BY created_at DESC
LIMIT :count
OFFSET :page;

/* @name getLobbyById */
SELECT * FROM lobbies
WHERE lobby_id = :lobby_id;

/* @name getNewLobbiesByUserAndBlockHeight */
SELECT lobby_id FROM lobbies
WHERE lobby_creator = :wallet
AND creation_block_height = :block_height;

/* @name getLobbyStatus */
SELECT lobby_state FROM lobbies
WHERE lobby_id = :lobby_id;

/*  Moves  */

/* @name getRoundMoves */
SELECT * FROM match_moves
WHERE lobby_id = :lobby_id!
AND   round = :round!;

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

/* NFT stats */

/* @name getNftScore */
SELECT * FROM nft_score
WHERE cde_name = :cde_name AND token_id = :token_id;

/* @name getNftLeaderboards */
SELECT nft_score.cde_name, nft_score.token_id, wins, losses, nft_owner
FROM nft_score
LEFT JOIN cde_erc721_data
ON
    nft_score.cde_name = cde_erc721_data.cde_name AND
    nft_score.token_id = cde_erc721_data.token_id
ORDER BY wins DESC;
