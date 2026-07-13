import { DefaultJobOptions } from 'bullmq';
import { redisConnection } from './redis';

export const queueConfig = {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  } as DefaultJobOptions,
};
