const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

function sanitizeUser(user) {
  const { passwordHash, email, ...safe } = user;
  return safe;
}

const getPublicProfile = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { username: req.params.username } });
  if (!user) throw ApiError.notFound('User not found');

  const publicPlaylists = await prisma.playlist.findMany({
    where: { userId: user.id, isPublic: true },
    orderBy: { updatedAt: 'desc' },
    include: { _count: { select: { tracks: true } } },
  });

  res.json({ success: true, data: { user: sanitizeUser(user), playlists: publicPlaylists } });
});

const updateProfile = asyncHandler(async (req, res) => {
  const { displayName, bio, avatarUrl } = req.body;

  const updated = await prisma.user.update({
    where: { id: req.user.id },
    data: {
      ...(displayName !== undefined && { displayName }),
      ...(bio !== undefined && { bio }),
      ...(avatarUrl !== undefined && { avatarUrl }),
    },
  });

  const { passwordHash, ...safe } = updated;
  res.json({ success: true, data: { user: safe } });
});

module.exports = { getPublicProfile, updateProfile };
