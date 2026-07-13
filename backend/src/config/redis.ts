import Redis, { RedisOptions } from 'ioredis';
import { config } from './index';
import { logger } from './logger';

export const redisConfig: RedisOptions = {
  host: config.REDIS_HOST,
  port: config.REDIS_PORT,
  maxRetriesPerRequest: null,
};

export const redisConnection = new Redis(redisConfig);
export const redisPublisher = new Redis(redisConfig);
export const redisSubscriber = new Redis(redisConfig);

redisConnection.on('connect', () => {
  logger.info('Redis (Default) connected successfully');
});

redisConnection.on('error', (err) => {
  logger.error('Redis connection error', err);
});

redisPublisher.on('connect', () => logger.info('Redis (Publisher) connected'));
redisSubscriber.on('connect', () => logger.info('Redis (Subscriber) connected'));
