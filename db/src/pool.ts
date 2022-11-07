import pg from 'pg';
/**
 * Pool of Postgres connections to avoid overhead of connecting on every request.
 */

export const creds = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PW,
    database: process.env.DB_NAME,
  }

const pool: pg.Pool = new pg.Pool(creds);


// Don't let a pg restart kill the app
pool.on('error', (err) => console.log(err, 'postgres pool error'));

export default pool;