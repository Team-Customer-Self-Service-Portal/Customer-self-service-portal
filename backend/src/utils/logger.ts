import winston from 'winston';

const { combine, timestamp, errors, json, colorize, printf } = winston.format;

const consoleFormat = combine(
  colorize(),
  timestamp(),
  errors({ stack: true }),
  printf(({ level, message, timestamp: ts, ...meta }) => `${String(ts)} [${level}] ${String(message)} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`)
);

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(timestamp(), errors({ stack: true }), json()),
  defaultMeta: { service: 'customer-self-service-backend' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({ format: consoleFormat }));
}
