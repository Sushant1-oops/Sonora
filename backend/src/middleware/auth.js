const { verifyAccessToken } = require('../utils/tokens');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const requireAuth = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Missing or malformed access token');
  }

  const token = header.split(' ')[1];

  try {
    const payload = verifyAccessToken(token);

    if (payload.type !== 'access') {
      throw ApiError.unauthorized('Invalid token type');
    }

    req.user = { id: payload.sub, username: payload.username };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('Access token expired');
    }
    throw ApiError.unauthorized('Invalid access token');
  }
});

const optionalAuth = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return next();
  }

  const token = header.split(' ')[1];

  try {
    const payload = verifyAccessToken(token);
    if (payload.type === 'access') {
      req.user = { id: payload.sub, username: payload.username };
    }
  } catch (err) {
    
  }

  next();
});

module.exports = { requireAuth, optionalAuth };
