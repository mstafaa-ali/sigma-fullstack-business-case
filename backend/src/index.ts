import app from './app';
import { config } from './config';
import { logger } from './config/logger';

const server = app.listen(config.PORT, () => {
  logger.info(`Server is running on port ${config.PORT} in ${config.NODE_ENV} mode`);
});

// Graceful shutdown
const gracefulShutdown = () => {
  logger.info('Received shutdown signal, shutting down gracefully...');
  server.close(() => {
    logger.info('HTTP server closed.');
    // Close database, redis, and queue connections here
    process.exit(0);
  });
  
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
