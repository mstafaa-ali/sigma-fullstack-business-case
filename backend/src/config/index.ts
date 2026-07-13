import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  
  // Database
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.coerce.number().default(5432),
  DB_NAME: z.string().default('sales_transform'),
  DB_USER: z.string().default('developer'),
  DB_PASSWORD: z.string().default('secret123'),
  
  // Redis
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  
  // Upload
  MAX_FILE_SIZE: z.coerce.number().default(50 * 1024 * 1024), // 50MB
  UPLOAD_DIR: z.string().default('./uploads'),
  
  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
});

export const config = envSchema.parse(process.env);
export type Config = z.infer<typeof envSchema>;
