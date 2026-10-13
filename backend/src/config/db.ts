import mongoose from 'mongoose';

import logger from './logger';

let cachedConn: typeof mongoose | null = null;
let cachedPromise: Promise<typeof mongoose> | null = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  if (cachedConn) {
    return cachedConn;
  }

  if (!cachedPromise) {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      const err = new Error('MONGODB_URI environment variable is not defined');
      logger.fatal({ event: 'database.connection.missing_uri' }, err.message);
      throw err;
    }

    cachedPromise = mongoose
      .connect(uri)
      .then((conn) => {
        logger.info({ event: 'database.connection.success', host: conn.connection.host }, `MongoDB Connected: ${conn.connection.host}`);
        return conn;
      })
      .catch((error: any) => {
        cachedPromise = null;
        logger.fatal({ event: 'database.connection.failed', err: error }, `Error connecting to MongoDB: ${error.message}`);
        throw error;
      });
  }

  try {
    cachedConn = await cachedPromise;
    return cachedConn;
  } catch (error: any) {
    cachedPromise = null;
    throw error;
  }
};

export default connectDB;

