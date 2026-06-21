require('dotenv').config();

const app = require('./app');
const logger = require('./config/logger');
const prisma = require('./config/prisma');
const redis = require('./config/redis');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`Sonora API [${process.env.INSTANCE_ID || 'default'}] listening on port ${PORT}`);
});




async function shutdown(signal) {
  logger.info(`${signal} received, shutting down gracefully...`);

  server.close(async () => {
    logger.info('HTTP server closed');
    await prisma.$disconnect();
    redis.disconnect();
    process.exit(0);
  });

  
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection:', reason);
});
