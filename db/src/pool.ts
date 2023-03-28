import pg from 'pg';
/**
 * Pool of Postgres connections to avoid overhead of connecting on every request.
 */

export const creds = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PW,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || '5432', 10),
};

let pool: pg.Pool | null;

export function setPool(newPool: pg.Pool) {
  pool = newPool;
}

export function requirePool(): pg.Pool {
  if (pool === null) {
    throw new Error('Database connection not yet initialized!');
  }
  return pool;
}
export const testPool = new pg.Pool(creds);
