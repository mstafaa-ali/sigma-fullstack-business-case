import knex from 'knex';
import { config } from './index';
import { logger } from './logger';

export const db = knex({
  client: 'pg',
  connection: {
    host: config.DB_HOST,
    port: config.DB_PORT,
    user: config.DB_USER,
    password: config.DB_PASSWORD,
    database: config.DB_NAME,
  },
  pool: {
    min: 2,
    max: 10,
  },
});

db.raw('SELECT 1')
  .then(() => logger.info('Database connected successfully'))
  .catch((err) => logger.error('Database connection failed', err));
