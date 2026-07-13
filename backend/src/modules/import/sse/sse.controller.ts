import { Request, Response } from 'express';
import Redis from 'ioredis';
import { redisConfig } from '../../../config/redis';

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
  const subscriber = new Redis(redisConfig);
  const channel = `${CHANNEL_PREFIX}${sessionId}`;

  subscriber.subscribe(channel, (err) => {
    if (err) {
      res.write(`event: error\ndata: ${JSON.stringify({ message: 'Subscribe failed' })}\n\n`);
      return;
    }
  });

  subscriber.on('message', (ch, message) => {
    if (ch === channel) {
      const event = JSON.parse(message);
      res.write(`event: ${event.type}\ndata: ${message}\n\n`);

      // Auto-close on completion or failure
      if (event.type === 'completed' || event.status === 'failed') {
        setTimeout(() => {
          res.write(`event: close\ndata: {}\n\n`);
          res.end();
          subscriber.unsubscribe(channel);
          subscriber.quit();
        }, 1000);
      }
    }
  });

  // Cleanup on client disconnect
  req.on('close', () => {
    subscriber.unsubscribe(channel);
    subscriber.quit();
  });
}
