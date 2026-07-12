import { config } from 'dotenv';
import path from 'path';

// Load environment variables from .env
config({ path: path.join(process.cwd(), '.env') });

const dbConfig = {
  client: 'pg',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'sales_transform',
    user: process.env.DB_USER || 'developer',
    password: process.env.DB_PASSWORD || 'secret123',
  },
  pool: {
    min: 2,
    max: 10,
  },
  migrations: {
    directory: './src/database/migrations',
    extension: 'ts',
  },
  seeds: {
    directory: './src/database/seeds',
    extension: 'ts',
  },
};

export default dbConfig;
