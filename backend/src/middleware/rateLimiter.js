const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const redis = require('../config/redis');






function makeLimiter({ windowMs, max, message }) {
  if (process.env.NODE_ENV === 'development') {
    return (req, res, next) => next();
  }
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message },
    store: new RedisStore({
      sendCommand: (...args) => redis.call(...args),
    }),
  });
}


const authLimiter = makeLimiter({
  windowMs: 15 * 60 * 1000, 
  max: 10,
  message: 'Too many attempts. Please try again in 15 minutes.',
});


const apiLimiter = makeLimiter({
  windowMs: 60 * 1000, 
  max: 120,
  message: 'Too many requests. Please slow down.',
});


const searchLimiter = makeLimiter({
  windowMs: 60 * 1000,
  max: 60,
  message: 'Too many search requests. Please slow down.',
});

module.exports = { authLimiter, apiLimiter, searchLimiter };
