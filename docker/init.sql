-- paima general
CREATE TABLE block_heights ( 
  block_height INTEGER PRIMARY KEY,
  seed TEXT NOT NULL,
  done BOOLEAN NOT NULL DEFAULT false
);
CREATE TABLE scheduled_data (
  id SERIAL PRIMARY KEY,
  block_height INTEGER NOT NULL,
  input_data TEXT NOT NULL
);
CREATE TABLE nonces (
  nonce TEXT PRIMARY KEY,
  block_height INTEGER NOT NULL
);
CREATE TABLE global_user_state (
  wallet TEXT NOT NULL PRIMARY KEY,
  wins INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE nfts (
  wallet TEXT NOT NULL,
  block_height INTEGER NOT NULL,
  address TEXT NOT NULL,
  token_id INTEGER NOT NULL,
  timestamp TIMESTAMP,
  PRIMARY KEY (wallet, block_height)
);
--  tower defense specific 
CREATE TABLE maps (
  name TEXT PRIMARY KEY,
  layout TEXT NOT NULL
);

CREATE TABLE configs(
  id TEXT PRIMARY KEY,
  creator TEXT NOT NULL,
  version INTEGER NOT NULL,
  content TEXT NOT NULL
);

CREATE TYPE lobby_status AS ENUM ('open', 'active', 'finished', 'closed');
CREATE TYPE role_setting AS ENUM ('attacker', 'defender', 'random');
-- match state before a round is the gold in each side, and health/upgrade status of every structure.
-- not practical to keep the state of every single tower of every single game in its own table, so we'll keep it as a json blob in the lobbies table and renew every round
-- TODO or we can keep it in the rounds table? might help with game replays
CREATE TABLE lobbies(
  lobby_id TEXT PRIMARY KEY,
  lobby_creator TEXT NOT NULL,
  creator_faction role_setting NOT NULL,
  lobby_state lobby_status NOT NULL DEFAULT 'open',
  player_two TEXT,
  created_at TIMESTAMP NOT NULL,
  creation_block_height INTEGER NOT NULL,
  hidden BOOLEAN NOT NULL DEFAULT false,
  practice BOOLEAN NOT NULL DEFAULT false,
  config_id TEXT references configs(id),
  map TEXT NOT NULL references maps(name),
  num_of_rounds INTEGER NOT NULL,
  round_length INTEGER NOT NULL,
  current_round INTEGER NOT NULL DEFAULT 0,
  current_match_state JSONB NOT NULL
);
CREATE TYPE move_type AS ENUM ('build', 'upgrade', 'repair', 'salvage');
-- move targets are usually structure ids, or map coordinates in the case of build.
-- we encode them as text and parse it later. Coordinates will be 'x,y'
CREATE TABLE match_moves(
  id SERIAL PRIMARY KEY,
  lobby_id TEXT NOT NULL references lobbies(lobby_id) ON DELETE CASCADE,
  wallet TEXT NOT NULL,
  round INTEGER NOT NULL,
  move_type move_type NOT NULL,
  move_target TEXT NOT NULL
);
CREATE TYPE match_result AS ENUM ('win', 'loss');
CREATE TABLE final_match_state (
   lobby_id TEXT NOT NULL,
   player_one_wallet TEXT NOT NULL,
   player_one_result match_result NOT NULL,
   player_one_gold INTEGER NOT NULL,
   player_two_wallet TEXT NOT NULL,
   player_two_result match_result NOT NULL,
   player_two_gold INTEGER NOT NULL,
   final_health INTEGER NOT NULL,
   UNIQUE (lobby_id)
);

INSERT INTO maps(name, layout)
VALUES
('jungle','1111111111111222222222\r\n1555155515551266626662\r\n1515151515151262626262\r\n1515551555155662666262\r\n1511111111111222222262\r\n1511111555111266622262\r\n3555511515551262626694\r\n1511515511151262666262\r\n1511555111155662222262\r\n1511111155511222666262\r\n1515555151511266626262\r\n1555115551555662226662\r\n1111111111111222222222'),
('backwards','1111111111111222222222\r\n1555551155551266666662\r\n1511151151151262222262\r\n1511155551151266662262\r\n1511111111151222262262\r\n1511155551155666662262\r\n3555151151111222222264\r\n1515151155555226666692\r\n1515551111115666222262\r\n1511111555511222266662\r\n1511111511511222262222\r\n1555555511555666662222\r\n1111111111111222222222'),
('crossing', '1111111111111222222222\r\n1111155555111226666222\r\n1555551115111226226662\r\n1511111115155666222262\r\n1515555115151222222262\r\n1515115115551222222262\r\n3555115115151222266664\r\n1511115555155662262262\r\n1511111111111266662262\r\n1515555511111222222662\r\n1515111511555666222622\r\n1555111555511226666622\r\n1111111111111222222222'),
('narrow', '1111111111111222222222\r\n1111111555111266622222\r\n1115551515111262626662\r\n1115155515155662626262\r\n1555111115551222666262\r\n1511111111111222222262\r\n3555555555555666666664\r\n1511111111111222222262\r\n1511155515551226662262\r\n1555151515151226262262\r\n1115151555151266262262\r\n1115551111155662266662\r\n1111111111111222222222'),
('snake', '1111111111111222222222\r\n1111155555116666622222\r\n1111151115116222622222\r\n1111151115116222622222\r\n1111151115116222622222\r\n3511151115126222622264\r\n1511151115126222622262\r\n1511151115126222622262\r\n1511151115126222622262\r\n1511151115566222622262\r\n1511151111222222622262\r\n1555551112222222666662\r\n1111111122222222222222'),
('straight','1111111111111222222222\r\n1155511111155662266622\r\n1151511555151262262962\r\n1551515515151266262262\r\n1511555115551226662262\r\n1511111111111222222262\r\n3555555555555666666664\r\n1511111111111222222262\r\n1511555115551226662262\r\n1551515515151266262262\r\n1151511555151262262962\r\n1155511111155662266622\r\n1111111111111222222222'),
('wavy','1111111111111222222222\r\n1115551115551226662222\r\n1555155515151226266662\r\n1511111555155666222262\r\n1555111111111222222262\r\n1515111555111222666262\r\n3515155515155662626694\r\n1515151115151262622262\r\n1515551115551262626662\r\n1511111111111266626222\r\n1551155551555222226222\r\n1155551155515666666222\r\n1111111111111222222222'),
('fork','1111111111111222222222\r\n1555555555555666666662\r\n1511111111111222222292\r\n1555555555555666666662\r\n1151111111111222222922\r\n1555555555555666666662\r\n3511111111111222222294\r\n1555555555555666666662\r\n1151111111111222222922\r\n1555555555555666666662\r\n1511111111111222222292\r\n1555555555555666666662\r\n1111111111111222222222'),
('islands','7777777777777888888888\r\n7555557887555566666668\r\n7511758228571112222268\r\n7511768228671556666668\r\n7511768228671512222228\r\n3517866666687555666668\r\n7717822222287111222264\r\n3517866666687555666668\r\n7511768228671512222228\r\n7511768228671556666668\r\n7511758228571112222268\r\n7555557887555566666668\r\n7777777777777888888888'),
('line','1111111111111222222222\r\n1111111111111222222222\r\n1111111111111222222222\r\n1111111111111222222222\r\n1111111111111222222222\r\n1111111111111222222222\r\n3555555555555666666664\r\n1111111111111222222222\r\n1111111111111222222222\r\n1111111111111222222222\r\n1111111111111222222222\r\n1111111111111222222222\r\n1111111111111222222222'),
('reflection', '1111111111111222222222\r\n1111111111111222222222\r\n1155511115551222222222\r\n1551555155155226262222\r\n1551111111111222222222\r\n1511115551115666266662\r\n3511111111111222222264\r\n1511115551115666266662\r\n1551555155155226262222\r\n1151511115151226662222\r\n1155511115551222222222\r\n1111111111111222222222\r\n1111111111111222222222');

INSERT INTO configs(id, creator, version, content)
VALUES('defaultdefault', '0x0', 1, 
'gs10;bh25;gd100;ga100;md300;ma260;rv25;rc25;rp50;hb5;sb10;at;1;p50;h12;c21;d15;r2;2;p25;h15;c16;d18;r2;3;p25;h18;c16;d20;r3;pt;1;p50;h50;c12;d2;r4;2;p25;h65;c9;d3;r4;3;p25;h80;c8;d4;r5;st;1;p50;h50;c20;d3;r2;2;p25;h65;c26;d4;r2;3;p25;h80;c26;d5;r3;gc;1;p70;h15;r20;c10;d1;br3;bc1;s4;2;p35;h18;r16;c13;d1;br3;bc1;s6;3;p35;h20;r12;c16;d1;br3;bc1;s8;jc;1;p70;h2;r16;c13;d1;br3;bc1;s18;2;p35;h3;r16;c17;d2;br3;bc1;s22;3;p35;h4;r16;c20;d3;br2;bc30;s26;mc;1;p60;h6;r18;c7;d1;br1;bc5;s8;ac60;ar2;2;p40;h8;r16;c10;d2;br1;bc5;s10;ac60;ar1;3;p40;h10;r16;c13;d2;br3;bc30;s12;ac50;ar2'
);

-- paima general again

CREATE TABLE rounds(
  id SERIAL PRIMARY KEY,
  lobby_id TEXT NOT NULL references lobbies(lobby_id) ON DELETE CASCADE,
  round_within_match INTEGER NOT NULL,
  match_state JSONB NOT NULL,
  starting_block_height INTEGER NOT NULL references block_heights(block_height),
  execution_block_Height INTEGER references block_heights(block_height)
);
CREATE FUNCTION update_lobby_round() RETURNS TRIGGER AS $$
BEGIN
  UPDATE lobbies 
  SET 
  current_round = NEW.round_within_match
  WHERE lobbies.lobby_id = NEW.lobby_id;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_current_round
AFTER INSERT ON rounds
FOR EACH ROW 
EXECUTE FUNCTION update_lobby_round();
