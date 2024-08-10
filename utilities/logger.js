const winston = require("winston");

const format = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  //   winston.format.align(),//tab
  winston.format.printf(
    (info) => `${info.level}: ${[info.timestamp]}: ${info.message}`
  ),
  winston.format.json()
);

const logConfiguration = {
  transports: [
    new winston.transports.Console({
      level: "warn",
      filename: "public/logs/warn.log",
      format: format,
    }),
    new winston.transports.File({
      level: "error",
      filename: "public/logs/error.log",
      format: format,
    }),
    new winston.transports.File({
      level: "info",
      filename: "public/logs/info.log",
      format: format,
    }),
  ],
};

module.exports = winston.createLogger(logConfiguration);
