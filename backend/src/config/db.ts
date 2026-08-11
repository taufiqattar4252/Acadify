import mongoose from 'mongoose';

import logger from './logger';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI as string);
    logger.info({ event: 'database.connection.success', host: conn.connection.host }, `MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    logger.fatal({ event: 'database.connection.failed', err: error }, `Error connecting to MongoDB: ${error.message}`);
    throw error;
  }
};

export default connectDB;
