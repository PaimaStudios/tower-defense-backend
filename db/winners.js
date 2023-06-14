import pg from 'pg';

const creds = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PW,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || '5432', 10),
};

const WINNERS_LIMIT = 120;
const START_BLOCKHEIGHT = 11883010;

const selectWinners = async () => {
  const pool = new pg.Pool(creds);
  const winners = await pool.query(`
  SELECT 
    final_match_state.lobby_id,
    lobbies.lobby_state,
    lobbies.creation_block_height,
    CASE WHEN player_one_result='win' THEN player_one_wallet
         WHEN player_two_result='win' THEN player_two_wallet
    END as winner 
  FROM lobbies
  JOIN final_match_state
  ON final_match_state.lobby_id = lobbies.lobby_id
  WHERE creation_block_height >= ${START_BLOCKHEIGHT}
  ORDER BY creation_block_height ASC
`);

  const uniqueWinners = winners.rows.reduce((acc, curr) => {
    if (acc.includes(curr.winner)) return acc;
    return [...acc, curr.winner];
  }, []);
  const firstWinners = uniqueWinners.slice(0, WINNERS_LIMIT);

  console.log(`First ${WINNERS_LIMIT} unique winners:`);
  console.log(firstWinners);
};

selectWinners();
