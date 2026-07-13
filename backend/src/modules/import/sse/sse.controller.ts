import { Request, Response } from 'express';
import Redis from 'ioredis';
import { redisConfig } from '../../../config/redis';
import { logger } from '../../../config/logger';

const CHANNEL_PREFIX = 'import:progress:';

/**
 * GET /api/import/sessions/:id/progress
 * SSE endpoint untuk real-time progress tracking
 */
export function streamProgress(req: Request, res: Response): void {
  const { id: sessionId } = req.params;

  // SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Nginx compatibility
  res.flushHeaders();

  // Send initial connection event
  res.write(`event: connected\ndata: ${JSON.stringify({ sessionId })}\n\n`);

  // Subscribe to Redis channel
  let subscriber: Redis | null = null;
  let isCleanedUp = false;
  const channel = `${CHANNEL_PREFIX}${sessionId}`;

  const cleanup = () => {
    if (isCleanedUp) return;
    isCleanedUp = true;

    if (subscriber) {
      subscriber.unsubscribe(channel).catch(() => {});
      subscriber.quit().catch(() => {});
      subscriber = null;
    }
  };

  try {
    subscriber = new Redis({
      ...redisConfig,
      // Prevent subscriber from crashing the process
      maxRetriesPerRequest: null,
      retryStrategy(times: number) {
        // Don't retry indefinitely for SSE subscribers
        if (times > 3) return null;
        return Math.min(times * 200, 1000);
      },
      lazyConnect: false,
    });

    subscriber.on('error', (err) => {
      logger.warn('SSE Redis Subscriber Error:', { error: err.message, sessionId });
      // Don't crash - just clean up gracefully
      cleanup();
      try {
        res.write(`event: error\ndata: ${JSON.stringify({ message: 'Connection lost' })}\n\n`);
        res.end();
      } catch {
        // Response may already be closed
      }
    });

    subscriber.subscribe(channel, (err) => {
      if (err) {
        logger.error('SSE Redis subscribe failed:', { error: err.message, sessionId });
        res.write(`event: error\ndata: ${JSON.stringify({ message: 'Subscribe failed' })}\n\n`);
        cleanup();
        return;
      }
    });

    subscriber.on('message', (ch, message) => {
      if (ch !== channel || isCleanedUp) return;

      try {
        const event = JSON.parse(message);
        res.write(`event: ${event.type}\ndata: ${message}\n\n`);

        // Auto-close on completion or failure
        if (event.type === 'completed' || event.status === 'failed') {
          setTimeout(() => {
            try {
              res.write(`event: close\ndata: {}\n\n`);
              res.end();
            } catch {
              // Response may already be closed
            }
            cleanup();
          }, 1000);
        }
      } catch (err) {
        logger.warn('SSE message parse error:', { error: err, sessionId });
      }
    });
  } catch (err) {
    logger.error('Failed to create SSE Redis subscriber:', { error: err, sessionId });
    res.write(`event: error\ndata: ${JSON.stringify({ message: 'Failed to establish connection' })}\n\n`);
    res.end();
    return;
  }

  // Cleanup on client disconnect
  req.on('close', () => {
    cleanup();
  });
}
