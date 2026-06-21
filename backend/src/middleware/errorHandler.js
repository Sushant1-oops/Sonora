const logger = require('../config/logger');
const ApiError = require('../utils/ApiError');

function errorHandler(err, req, res, next) {
  let { statusCode, message, details } = err;

  
  if (err.code === 'P2002') {
    statusCode = 409;
    message = `A record with this ${err.meta?.target?.join(', ')} already exists`;
  } else if (err.code === 'P2025') {
    statusCode = 404;
    message = 'Record not found';
  }

  if (!statusCode) statusCode = 500;
  if (!message) message = 'Something went wrong';

  if (statusCode >= 500) {
    logger.error(err.stack || err.message);
  } else {
    logger.warn(`${statusCode} - ${message}`);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(details && { details }),
    ...(process.env.NODE_ENV === 'development' && statusCode >= 500 && { stack: err.stack }),
  });
}

function notFoundHandler(req, res) {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
}

module.exports = { errorHandler, notFoundHandler };
