import mongoose from 'mongoose';
import { logger } from '../utils/logger';

interface DatabaseConfig {
  uri: string;
  options: mongoose.ConnectOptions;
}

const getDatabaseConfig = (): DatabaseConfig => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/customer-portal';
  
  const options: mongoose.ConnectOptions = {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    // Remove bufferMaxEntries and bufferCommands - they don't exist in ConnectOptions
    compressors: ['snappy', 'zlib']
  };

  return { uri, options };
};

export const connectDatabase = async (): Promise<void> => {
  try {
    const { uri, options } = getDatabaseConfig();
    
    mongoose.connection.on('connected', () => {
      logger.info('MongoDB connected successfully');
    });

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed through app termination');
      process.exit(0);
    });

    await mongoose.connect(uri, options);
    await setupIndexes();
    
  } catch (error) {
    logger.error('Failed to connect to MongoDB:', error);
    throw error;
  }
};

const setupIndexes = async (): Promise<void> => {
  try {
    const db = mongoose.connection.db;

    await db.collection('users').createIndexes([
      { key: { email: 1 }, unique: true },
      { key: { salesforceId: 1 }, unique: true, sparse: true },
      { key: { createdAt: -1 } },
      { key: { status: 1 } }
    ]);

    await db.collection('cases').createIndexes([
      { key: { caseNumber: 1 }, unique: true },
      { key: { userId: 1, createdAt: -1 } },
      { key: { status: 1 } },
      { key: { priority: 1 } },
      { key: { salesforceId: 1 }, sparse: true },
      { key: { subject: 'text', description: 'text' } }
    ]);

    await db.collection('knowledgearticles').createIndexes([
      { key: { title: 'text', content: 'text', tags: 'text' } },
      { key: { category: 1 } },
      { key: { isPublished: 1, createdAt: -1 } },
      { key: { viewCount: -1 } },
      { key: { tags: 1 } }
    ]);

    await db.collection('communityposts').createIndexes([
      { key: { userId: 1, createdAt: -1 } },
      { key: { category: 1 } },
      { key: { isResolved: 1 } },
      { key: { title: 'text', content: 'text' } },
      { key: { tags: 1 } },
      { key: { upvotes: -1 } }
    ]);

    logger.info('Database indexes created successfully');
  } catch (error) {
    logger.error('Failed to create database indexes:', error);
  }
};

export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    await mongoose.connection.db.admin().ping();
    return true;
  } catch (error) {
    logger.error('Database health check failed:', error);
    return false;
  }
};

export const getDatabaseStats = async () => {
  try {
    const db = mongoose.connection.db;
    const stats = await db.stats();
    
    return {
      collections: stats.collections,
      dataSize: stats.dataSize,
      indexSize: stats.indexSize,
      objects: stats.objects,
      storageSize: stats.storageSize
    };
  } catch (error) {
    logger.error('Failed to get database stats:', error);
    throw error;
  }
};
