import { redisPublisher } from '../../../config/redis';
import { ProgressEvent } from './progress.types';

const CHANNEL_PREFIX = 'import:progress:';

/**
 * Publish progress event ke Redis channel
 */
export async function publishProgress(
  sessionId: string,
  event: ProgressEvent
): Promise<void> {
  event.timestamp = new Date().toISOString();
  await redisPublisher.publish(
    `${CHANNEL_PREFIX}${sessionId}`,
    JSON.stringify(event)
  );
}
