/*  Scheduled Data  */

/* @name removeScheduledData */
DELETE FROM scheduled_data
WHERE block_height = :block_height!
AND input_data = :input_data!;
/*  Stats  */

/* @name addWin */
UPDATE global_user_state
SET
wins = wins + 1
WHERE wallet = :wallet;

/* @name addLoss */
UPDATE global_user_state
SET
losses = losses + 1
WHERE wallet = :wallet;

/* @name addTie */
UPDATE global_user_state
SET
ties = ties + 1
WHERE wallet = :wallet;

/*  Rounds  */

/* @name executeRound */
UPDATE rounds
SET execution_block_height = :execution_block_height!
WHERE rounds.lobby_id = :lobby_id!
AND rounds.round_within_match = :round!;

/*  Configs  */

/*  Lobbies  */

/* @name startMatch */
UPDATE lobbies
SET  
lobby_state = 'active',
player_two = :player_two!,
current_match_state = :current_match_state!
WHERE lobby_id = :lobby_id!
AND player_two IS NULL
RETURNING *;

/* @name updateCurrentMatchState */
UPDATE lobbies
SET current_match_state = :current_match_state!
WHERE lobby_id = :lobby_id;

/* @name updateCurrentRound */
UPDATE lobbies
SET current_round = :round!
WHERE lobby_id = :lobby_id!;

/* @name closeLobby */
UPDATE lobbies
SET  lobby_state = 'closed'
WHERE lobby_id = :lobby_id!
AND player_two IS NULL;

/* @name endMatch */
UPDATE lobbies
SET  lobby_state = 'finished'
WHERE lobby_id = :lobby_id!;
