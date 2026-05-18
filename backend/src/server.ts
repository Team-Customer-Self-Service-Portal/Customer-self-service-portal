import compression from 'compression';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import mongoose from 'mongoose';
import swaggerUi from 'swagger-ui-express';
import { connectDatabase } from './config/database';
import redisClient, { connectRedis } from './config/redis';
import { swaggerSpec } from './config/swagger';
import { errorHandler } from './middleware/errorHandler';
import { httpLogger } from './middleware/logger';
import { generalLimiter } from './middleware/rateLimiter';
import routes from './routes';
import { syncAllCases } from './services/salesforce';
import { logger } from './utils/logger';

dotenv.config();

export const app = express();

const allowedOrigins = new Set<string>([
  'http://localhost:3000',
  'https://customer-self-service-portal.vercel.app',
]);

if (process.env.FRONTEND_URL) {
  allowedOrigins.add(process.env.FRONTEND_URL);
}

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);
app.use(compression());
app.use(httpLogger);
app.use(express.json());
app.use(generalLimiter);

app.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api', routes);
app.use(errorHandler);

const port = Number(process.env.PORT || 5000);
let server: ReturnType<typeof app.listen>;

const start = async (): Promise<void> => {
  await connectDatabase();
  await connectRedis();
  syncAllCases();

  server = app.listen(port, () => {
    logger.info(`Server started on ${port}`);
  });
};

const shutdown = async (): Promise<void> => {
  logger.info('Graceful shutdown initiated');
  if (server) {
    await new Promise<void>((resolve, reject) => server.close((err?: Error) => (err ? reject(err) : resolve())));
  }
  await mongoose.disconnect();
  try {
    await redisClient.quit();
  } catch {
    // ignore
  }
  process.exit(0);
};

process.on('SIGINT', () => {
  shutdown().catch(() => process.exit(1));
});
process.on('SIGTERM', () => {
  shutdown().catch(() => process.exit(1));
});

if (process.env.NODE_ENV !== 'test') {
  start().catch((error: unknown) => {
    logger.error('Failed to start server', { error: error instanceof Error ? error.message : String(error) });
    process.exit(1);
  });
}
