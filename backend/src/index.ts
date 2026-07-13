import app from './app';
import { config } from './config';
import { logger } from './config/logger';
import { closeWorkers } from './workers';
import { importQueue } from './queues/import.queue';
import { db } from './config/database';
import { redisConnection, redisPublisher, redisSubscriber } from './config/redis';

const server = app.listen(config.PORT, () => {
  logger.info(`Server is running on port ${config.PORT} in ${config.NODE_ENV} mode`);
});

// Graceful shutdown
const gracefulShutdown = async () => {
  logger.info('Received shutdown signal, shutting down gracefully...');
  
  try {
    server.close(() => {
      logger.info('HTTP server closed.');
    });

    // Close all workers first (finish current job)
    await closeWorkers();
    logger.info('Workers closed.');

    // Close queues
    await importQueue.close();
    logger.info('Queue closed.');

    // Close DB connection
    await db.destroy();
    logger.info('Database closed.');

    // Close Redis connections
    await redisConnection.quit();
    await redisPublisher.quit();
    await redisSubscriber.quit();
    logger.info('Redis connections closed.');

    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown', error);
    process.exit(1);
  }
  
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
