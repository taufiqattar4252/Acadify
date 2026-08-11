import dotenv from 'dotenv';
dotenv.config({ override: true });
import app from './app';
import connectDB from './config/db';

import logger from './config/logger';

// Handle uncaught exceptions
process.on('uncaughtException', (err: any) => {
  logger.fatal({ event: 'process.uncaught_exception', err }, 'UNCAUGHT EXCEPTION! 💥 Shutting down...');
  process.exit(1);
});

// Connect to Database
connectDB();

import { processScheduledNotifications } from './services/notificationService';

const port = process.env.PORT || 5000;
const server = app.listen(port, () => {
  logger.info(`App running on port ${port}...`);
  
  // Start polling for scheduled notifications every minute
  setInterval(() => {
    processScheduledNotifications().catch((err) => logger.error({ event: 'scheduled_notification_failed', err }, 'Scheduled notification failed'));
  }, 60 * 1000);
});

// Handle unhandled rejections
process.on('unhandledRejection', (err: any) => {
  logger.fatal({ event: 'process.unhandled_rejection', err }, 'UNHANDLED REJECTION! 💥 Shutting down...');
  server.close(() => {
    process.exit(1);
  });
});
