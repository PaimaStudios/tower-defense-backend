/*  Scheduled Data */

/* @name newScheduledData */
INSERT INTO scheduled_data(block_height, input_data)
VALUES (:block_height!, :input_data!);

/*  Rounds  */

/* 
  @name newRound
*/
INSERT INTO rounds(lobby_id, round_within_match, starting_block_height, execution_block_height)
VALUES (:lobby_id!, :round_within_match!, :starting_block_height!, :execution_block_height)
RETURNING *;

/*  Stats  */

/* @name newStats
  @param stats -> (wallet!, wins!, losses!, ties!)
*/
INSERT INTO global_user_state
VALUES :stats
ON CONFLICT (wallet)
DO NOTHING;

/* 
  @name updateStats
  @param stats -> (wallet!, wins!, losses!, ties!)
*/
INSERT INTO global_user_state
VALUES :stats
ON CONFLICT (wallet)
DO UPDATE SET
wins = EXCLUDED.wins,
losses = EXCLUDED.losses,
ties = EXCLUDED.ties;

/*  NFTs  */

/* @name newNFT */
INSERT INTO nfts(wallet, block_height, address, token_id, timestamp)
VALUES(:wallet!, :block_height!, :address!, :token_id!, :timestamp!)
ON CONFLICT (wallet, block_height)
DO UPDATE SET
address = EXCLUDED.address,
token_id = EXCLUDED.token_id,
timestamp = EXCLUDED.timestamp;

/*  Configs  */

/* @name createConfig */
INSERT INTO configs(id, content)
VALUES(:id!, :content!);

/*  Lobbies  */

/* 
  @name createLobby 
*/
INSERT INTO lobbies(
  lobby_id,
  lobby_creator,
  num_of_rounds,
  current_round,
  creation_block_height,
  map,
  created_at,
  hidden,
  practice,
  current_match_state,
  player_two)
VALUES(
  :lobby_id!,
  :lobby_creator!,
  :num_of_rounds!,
  :current_round!,
  :creation_block_height!,
  :map!,
  :created_at!,
  :hidden!,
  :practice!,
  :current_match_state!,
  :player_two)
 ;

/*  Moves  */

/* 
  @name newMatchMove
  @param new_move -> (lobby_id!, wallet!, round!, move_type!, move_target!)
*/
INSERT INTO match_moves(lobby_id, wallet, round, move_type, move_target)
VALUES :new_move;
