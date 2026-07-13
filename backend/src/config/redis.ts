import Redis, { RedisOptions } from 'ioredis';
import { config } from './index';
import { logger } from './logger';

export const redisConfig: RedisOptions = {
  host: config.REDIS_HOST,
  port: config.REDIS_PORT,
  maxRetriesPerRequest: null,
  retryStrategy(times: number) {
    const delay = Math.min(times * 200, 5000);
    logger.warn(`Redis reconnecting... attempt ${times}, delay ${delay}ms`);
    return delay;
  },
};

export const redisConnection = new Redis(redisConfig);
export const redisPublisher = new Redis(redisConfig);
export const redisSubscriber = new Redis(redisConfig);

// Attach error handlers to ALL connections to prevent uncaught exceptions
redisConnection.on('connect', () => {
  logger.info('Redis (Default) connected successfully');
});
redisConnection.on('error', (err) => {
  logger.error('Redis (Default) connection error', { error: err.message });
});

redisPublisher.on('connect', () => logger.info('Redis (Publisher) connected'));
redisPublisher.on('error', (err) => {
  logger.error('Redis (Publisher) connection error', { error: err.message });
});

redisSubscriber.on('connect', () => logger.info('Redis (Subscriber) connected'));
redisSubscriber.on('error', (err) => {
  logger.error('Redis (Subscriber) connection error', { error: err.message });
});
