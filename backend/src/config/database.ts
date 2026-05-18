import mongoose from 'mongoose';
import { logger } from '../utils/logger';

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 5000;

const delay = async (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

export const connectDatabase = async (attempt = 1): Promise<void> => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI is not configured');
    }

    await mongoose.connect(uri, { autoIndex: true });
    logger.info('MongoDB connected successfully');
  } catch (error) {
    logger.error('MongoDB connection failed', { attempt, error: error instanceof Error ? error.message : String(error) });
    if (attempt >= MAX_RETRIES) {
      throw error;
    }
    await delay(RETRY_DELAY_MS);
    await connectDatabase(attempt + 1);
  }
};
