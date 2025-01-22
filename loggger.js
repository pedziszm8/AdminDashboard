// logger.js
const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

// Format dla timestampu i struktury logów
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(
    ({ timestamp, level, message, label }) =>
      `${timestamp} ${level} [${label || 'unknown'}]: ${message}`
  )
);

// Logger dla informacji (info)
const infoLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  transports: [
    new DailyRotateFile({
      filename: path.join('logs', '%DATE%-logs-info.log'),
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d',
    }),
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), logFormat),
    }),
  ],
});

// Logger dla błędów (error)
const errorLogger = winston.createLogger({
  level: 'error',
  format: logFormat,
  transports: [
    new DailyRotateFile({
      filename: path.join('logs', '%DATE%-logs-error.log'),
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d',
    }),
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), logFormat),
    }),
  ],
});

module.exports = { infoLogger, errorLogger };
