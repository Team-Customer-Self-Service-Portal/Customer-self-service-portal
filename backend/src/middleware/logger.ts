import morgan from 'morgan';
import { logger } from '../utils/logger';

morgan.token('user-id', (req: any) => {
  return req.user?.id || 'anonymous';
});

export const requestLogger = morgan(
  ':method :url :status :res[content-length] - :response-time ms - User: :user-id',
  {
    stream: {
      write: (message: string) => {
        logger.http(message.trim());
      },
    },
  }
);

export const errorLogger = morgan(
  ':method :url :status :res[content-length] - :response-time ms',
  {
    skip: (req, res) => res.statusCode < 400,
    stream: {
      write: (message: string) => {
        logger.error(message.trim());
      },
    },
  }
);
