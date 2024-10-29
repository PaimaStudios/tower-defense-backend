/*  Rounds  */

/* @name executeRound */
UPDATE rounds
SET execution_block_height = :execution_block_height!

WHERE rounds.lobby_id = :lobby_id!
AND rounds.round_within_match = :round!;

/*  Lobbies  */

/* @name startMatch */
UPDATE lobbies
SET
lobby_state = 'active',
player_two = :player_two!,
current_match_state = :current_match_state!,
creator_faction = :creator_faction
WHERE lobby_id = :lobby_id!
AND player_two IS NULL
RETURNING *;

/* @name updateCurrentMatchState */
UPDATE lobbies
SET current_match_state = :current_match_state!
WHERE lobby_id = :lobby_id;

/* @name closeLobby */
UPDATE lobbies
SET  lobby_state = 'closed'
WHERE lobby_id = :lobby_id!
AND player_two IS NULL;

/* @name endMatch */
UPDATE lobbies
SET  lobby_state = 'finished',
current_match_state = :current_match_state!
WHERE lobby_id = :lobby_id!;

/* @name wipeOldlobbies */
DELETE from lobbies
WHERE lobby_state = 'finished'
AND created_at < :date;
