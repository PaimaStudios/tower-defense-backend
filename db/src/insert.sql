/*  Rounds  */

/*
  @name newRound
*/
INSERT INTO rounds(lobby_id, round_within_match, match_state, starting_block_height, execution_block_height)
VALUES (:lobby_id!, :round_within_match!, :match_state!, :starting_block_height!, :execution_block_height)
RETURNING *;

/*  Stats  */

/* @name newStats
  @param stats -> (wallet!, wins!, losses!)
*/
INSERT INTO global_user_state
VALUES :stats
ON CONFLICT (wallet)
DO NOTHING;

/*
  @name updateStats
  @param stats -> (wallet!, wins!, losses!)
*/
INSERT INTO global_user_state
VALUES :stats
ON CONFLICT (wallet)
DO UPDATE SET
wins = EXCLUDED.wins,
losses = EXCLUDED.losses;

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
INSERT INTO configs(id, creator, version, content)
VALUES(:id!, :creator!, :version!, :content!)
ON CONFLICT(id)
DO NOTHING;

/*  Lobbies  */

/*
  @name createLobby
*/
INSERT INTO lobbies(
  lobby_id,
  lobby_creator,
  lobby_creator_token_id,
  creator_faction,
  num_of_rounds,
  round_length,
  current_round,
  lobby_state,
  creation_block_height,
  map,
  config_id,
  created_at,
  hidden,
  practice,
  bot_difficulty,
  autoplay,
  current_match_state,
  player_two)
VALUES(
  :lobby_id!,
  :lobby_creator!,
  :lobby_creator_token_id!,
  :creator_faction!,
  :num_of_rounds!,
  :round_length!,
  :current_round!,
  :lobby_state!,
  :creation_block_height!,
  :map!,
  :config_id!,
  :created_at!,
  :hidden!,
  :practice!,
  :bot_difficulty!,
  :autoplay!,
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

/* Final Match State */

/* @name newFinalState
  @param final_state -> (lobby_id!, player_one_wallet!, player_one_result!, player_one_gold!, player_two_wallet!, player_two_result!, player_two_gold!, final_health!)
*/
INSERT INTO final_match_state(lobby_id, player_one_wallet, player_one_result, player_one_gold, player_two_wallet, player_two_result, player_two_gold, final_health)
VALUES :final_state;

/* NFT Score */

/* @name addNftScore */
INSERT INTO nft_score(cde_name, token_id, wins, losses, streak, best_streak)
VALUES (:cde_name!, :token_id!, :wins!, :losses!, :wins!, :wins!)
ON CONFLICT (cde_name, token_id)
DO UPDATE SET
  wins = nft_score.wins + EXCLUDED.wins,
  losses = nft_score.losses + EXCLUDED.losses,
  streak = (CASE WHEN EXCLUDED.wins > 0 THEN nft_score.streak + EXCLUDED.wins ELSE 0 END),
  best_streak = GREATEST(nft_score.best_streak, (CASE WHEN EXCLUDED.wins > 0 THEN nft_score.streak + EXCLUDED.wins ELSE 0 END));
