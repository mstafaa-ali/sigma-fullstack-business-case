import { QueueEvents } from 'bullmq';
import { redisConfig } from '../../config/redis';
import { QUEUE_NAMES } from '../queue.constants';
import { logger } from '../../config/logger';

export const importQueueEvents = new QueueEvents(QUEUE_NAMES.IMPORT, {
  connection: redisConfig as any,
});

importQueueEvents.on('completed', ({ jobId, returnvalue }) => {
  logger.info(`Job ${jobId} completed.`, { returnvalue });
});

importQueueEvents.on('failed', ({ jobId, failedReason }) => {
  logger.error(`Job ${jobId} failed.`, { failedReason });
});

importQueueEvents.on('error', (err) => {
  logger.error('Queue Events Error', err);
});
