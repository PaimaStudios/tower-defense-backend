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

const selectWinners = async pool => {
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

const selectGamesPlayed = async pool => {
  const totalGames = await pool.query(`SELECT COUNT(*) FROM final_match_state`);
  console.log('Total games played: ');
  console.log(totalGames.rows);
};

const selectUniquePlayers = async pool => {
  const players = await pool.query(`
    SELECT 
      COUNT(DISTINCT user_address) FILTER (WHERE user_address LIKE '0x%') AS evm,
      COUNT(DISTINCT user_address) FILTER (WHERE user_address LIKE 'addr%') AS cardano,
      COUNT(DISTINCT user_address) - COUNT(DISTINCT user_address) FILTER (WHERE user_address LIKE 'addr%') - COUNT(DISTINCT user_address) FILTER (WHERE user_address LIKE '0x%') as polkadot
    FROM historical_game_inputs
`);
  console.log('Unique players wallet distribution: ');
  console.log(players.rows);
};

const run = async () => {
  const pool = new pg.Pool(creds);
  await selectWinners(pool);
  await selectGamesPlayed(pool);
  await selectUniquePlayers(pool);

  process.exit(0);
};

run();
