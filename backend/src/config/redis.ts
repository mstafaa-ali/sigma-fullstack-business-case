import Redis from 'ioredis';
import { config } from './index';
import { logger } from './logger';

export const redisConnection = new Redis({
  host: config.REDIS_HOST,
  port: config.REDIS_PORT,
  maxRetriesPerRequest: null,
});

redisConnection.on('connect', () => {
  logger.info('Redis connected successfully');
});

redisConnection.on('error', (err) => {
  logger.error('Redis connection error', err);
});
