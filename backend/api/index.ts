import app from '../src/app';
import connectDB from '../src/config/db';

// Connect to DB for serverless environment
// Ensure we don't connect multiple times in warm containers
let isConnected = false;

export default async (req: any, res: any) => {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
  
  // Hand off to Express
  app(req, res);
};
