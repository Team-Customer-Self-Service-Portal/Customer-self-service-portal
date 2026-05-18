import morgan from 'morgan';
import { logger } from '../utils/logger';

export const morganStream = {
  write: (message: string): void => {
    logger.info(message.trim());
  },
};

export const httpLogger = morgan('combined', { stream: morganStream });
