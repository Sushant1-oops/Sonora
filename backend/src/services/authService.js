const prisma = require('../config/prisma');
const redis = require('../config/redis');
const ApiError = require('../utils/ApiError');
const {
  hashPassword,
  comparePassword,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
} = require('../utils/tokens');

const REFRESH_TTL_SECONDS = 7 * 24 * 60 * 60; 



const refreshKey = (jti) => `refresh:${jti}`;

async function register({ email, username, password, displayName }) {
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });

  if (existing) {
    throw ApiError.conflict(
      existing.email === email ? 'Email already in use' : 'Username already taken'
    );
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: { email, username, passwordHash, displayName },
  });

  return user;
}

async function login({ email, password }, meta = {}) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  return issueTokens(user, meta);
}

async function issueTokens(user, meta = {}) {
  const accessToken = signAccessToken(user);
  const { token: refreshToken, jti } = signRefreshToken(user);

  await redis.set(refreshKey(jti), user.id, 'EX', REFRESH_TTL_SECONDS);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      jti,
      tokenHash: hashToken(refreshToken),
      userAgent: meta.userAgent || null,
      ipAddress: meta.ipAddress || null,
      expiresAt: new Date(Date.now() + REFRESH_TTL_SECONDS * 1000),
    },
  });

  return { accessToken, refreshToken, user };
}

async function refresh(oldRefreshToken) {
  let payload;
  try {
    payload = verifyRefreshToken(oldRefreshToken);
  } catch (err) {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  if (payload.type !== 'refresh') {
    throw ApiError.unauthorized('Invalid token type');
  }

  const storedUserId = await redis.get(refreshKey(payload.jti));
  if (!storedUserId || storedUserId !== payload.sub) {
    throw ApiError.unauthorized('Refresh token has been revoked or is unknown');
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) {
    throw ApiError.unauthorized('User no longer exists');
  }

  
  await redis.del(refreshKey(payload.jti));
  await prisma.refreshToken
    .update({
      where: { jti: payload.jti },
      data: { revoked: true },
    })
    .catch(() => {}); 

  return issueTokens(user);
}

async function logout(refreshTokenRaw) {
  if (!refreshTokenRaw) return;

  try {
    const payload = verifyRefreshToken(refreshTokenRaw);
    await redis.del(refreshKey(payload.jti));
    await prisma.refreshToken
      .update({
        where: { jti: payload.jti },
        data: { revoked: true },
      })
      .catch(() => {});
  } catch (err) {
    
  }
}

async function logoutAll(userId) {
  const tokens = await prisma.refreshToken.findMany({
    where: { userId, revoked: false },
  });

  if (tokens.length > 0) {
    const keys = tokens.map((t) => refreshKey(t.jti));
    await redis.del(...keys);
  }

  await prisma.refreshToken.updateMany({
    where: { userId, revoked: false },
    data: { revoked: true },
  });

  return tokens.length;
}

module.exports = { register, login, refresh, logout, logoutAll, issueTokens };
