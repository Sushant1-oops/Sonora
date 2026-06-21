const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '15m';
const REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';

const BCRYPT_ROUNDS = 12;

async function hashPassword(plainPassword) {
  return bcrypt.hash(plainPassword, BCRYPT_ROUNDS);
}

async function comparePassword(plainPassword, hash) {
  return bcrypt.compare(plainPassword, hash);
}

function signAccessToken(user) {
  return jwt.sign(
    { sub: user.id, username: user.username, type: 'access' },
    ACCESS_SECRET,
    { expiresIn: ACCESS_EXPIRY }
  );
}

function verifyAccessToken(token) {
  return jwt.verify(token, ACCESS_SECRET);
}

function signRefreshToken(user) {
  
  const jti = crypto.randomUUID();
  const token = jwt.sign(
    { sub: user.id, jti, type: 'refresh' },
    REFRESH_SECRET,
    { expiresIn: REFRESH_EXPIRY }
  );
  return { token, jti };
}

function verifyRefreshToken(token) {
  return jwt.verify(token, REFRESH_SECRET);
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

module.exports = {
  hashPassword,
  comparePassword,
  signAccessToken,
  verifyAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
};
