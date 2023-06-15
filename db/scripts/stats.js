import pg from 'pg';

const creds = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PW,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || '5432', 10),
};

const selectGamesPlayed = async pool => {
  const totalGames = await pool.query(`SELECT COUNT(*) FROM lobbies`);
  console.log('Total # of matches played: ');
  console.log(totalGames.rows);
};

const selectRounds = async pool => {
  const totalRounds = await pool.query(`SELECT COUNT(*) FROM rounds`);
  console.log('Total # of rounds played: ');
  console.log(totalRounds.rows);
};

const selectGameInputSubmissions = async pool => {
  const totalInputs = await pool.query(`SELECT COUNT(*) FROM historical_game_inputs`);
  console.log('Total # of game inputs submitted: ');
  console.log(totalInputs.rows);
};

const selectTotalWallets = async pool => {
  const totalWallets = await pool.query(`SELECT COUNT(DISTINCT user_address) FROM historical_game_inputs`);
  console.log('Total # of unique player wallets: ');
  console.log(totalWallets.rows);
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
  await selectGamesPlayed(pool);
  await selectRounds(pool);
  await selectGameInputSubmissions(pool);
  await selectTotalWallets (pool);
  await selectUniquePlayers(pool);


  process.exit(0);
};

run();
