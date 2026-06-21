const authService = require('../services/authService');
const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

const REFRESH_COOKIE_NAME = 'sonora_refresh';
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; 

const refreshCookieOptions = {
  httpOnly: true, 
  secure: process.env.NODE_ENV === 'production', 
  sameSite: 'strict', 
  maxAge: REFRESH_COOKIE_MAX_AGE,
  path: '/api/auth', 
};

function sanitizeUser(user) {
  const { passwordHash, ...safe } = user;
  return safe;
}

const register = asyncHandler(async (req, res) => {
  const { email, username, password, displayName } = req.body;
  const user = await authService.register({ email, username, password, displayName });
  res.status(201).json({ success: true, data: { user: sanitizeUser(user) } });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const meta = { userAgent: req.headers['user-agent'], ipAddress: req.ip };

  const { accessToken, refreshToken, user } = await authService.login({ email, password }, meta);

  res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions);
  res.json({ success: true, data: { accessToken, user: sanitizeUser(user) } });
});

const refresh = asyncHandler(async (req, res) => {
  const oldToken = req.cookies?.[REFRESH_COOKIE_NAME];
  if (!oldToken) {
    throw ApiError.unauthorized('No refresh token provided');
  }

  const { accessToken, refreshToken, user } = await authService.refresh(oldToken);

  res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions);
  res.json({ success: true, data: { accessToken, user: sanitizeUser(user) } });
});

const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE_NAME];
  await authService.logout(token);
  res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/auth' });
  res.json({ success: true, message: 'Logged out' });
});

const logoutAll = asyncHandler(async (req, res) => {
  const count = await authService.logoutAll(req.user.id);
  res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/auth' });
  res.json({ success: true, message: `Logged out of ${count} session(s)` });
});

const me = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) throw ApiError.notFound('User not found');
  res.json({ success: true, data: { user: sanitizeUser(user) } });
});

module.exports = { register, login, refresh, logout, logoutAll, me };
