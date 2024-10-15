DROP TRIGGER update_current_round ON rounds;
DROP FUNCTION update_lobby_round() CASCADE;

DROP TABLE nonces;
DROP TABLE scheduled_data;
DROP TABLE match_moves;
DROP TABLE final_match_state;
DROP TABLE rounds;
DROP TABLE lobbies;
DROP TABLE configs;
DROP TABLE nfts;
DROP TABLE maps;
DROP TABLE paima_blocks;
DROP TABLE global_user_state;

DROP TYPE lobby_status;
DROP TYPE match_result;
DROP TYPE role_setting;
DROP TYPE move_type;
DROP TYPE bot_difficulty;
