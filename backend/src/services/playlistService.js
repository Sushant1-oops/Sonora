const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const musicService = require('./musicService');

async function createPlaylist(userId, { name, description, isPublic }) {
  return prisma.playlist.create({
    data: { userId, name, description, isPublic: !!isPublic },
  });
}

async function getUserPlaylists(userId) {
  return prisma.playlist.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    include: { _count: { select: { tracks: true } } },
  });
}

async function getPlaylistById(playlistId, requestingUserId) {
  const playlist = await prisma.playlist.findUnique({
    where: { id: playlistId },
    include: {
      tracks: {
        orderBy: { position: 'asc' },
        include: { track: true },
      },
      user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
    },
  });

  if (!playlist) {
    throw ApiError.notFound('Playlist not found');
  }

  if (!playlist.isPublic && playlist.userId !== requestingUserId) {
    throw ApiError.forbidden('This playlist is private');
  }

  return playlist;
}

async function assertOwnership(playlistId, userId) {
  const playlist = await prisma.playlist.findUnique({ where: { id: playlistId } });
  if (!playlist) throw ApiError.notFound('Playlist not found');
  if (playlist.userId !== userId) throw ApiError.forbidden('You do not own this playlist');
  return playlist;
}

async function updatePlaylist(playlistId, userId, updates) {
  await assertOwnership(playlistId, userId);

  const { name, description, isPublic, coverUrl } = updates;
  return prisma.playlist.update({
    where: { id: playlistId },
    data: {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(isPublic !== undefined && { isPublic }),
      ...(coverUrl !== undefined && { coverUrl }),
    },
  });
}

async function deletePlaylist(playlistId, userId) {
  await assertOwnership(playlistId, userId);
  await prisma.playlist.delete({ where: { id: playlistId } });
}

async function addTrackToPlaylist(playlistId, userId, spotifyId) {
  await assertOwnership(playlistId, userId);

  const track = await musicService.resolveAndCacheTrack(spotifyId);
  if (!track) throw ApiError.notFound('Track not found on Spotify');

  const lastTrack = await prisma.playlistTrack.findFirst({
    where: { playlistId },
    orderBy: { position: 'desc' },
  });
  const nextPosition = lastTrack ? lastTrack.position + 1 : 0;

  try {
    return await prisma.playlistTrack.create({
      data: { playlistId, trackId: track.id, position: nextPosition },
      include: { track: true },
    });
  } catch (err) {
    if (err.code === 'P2002') {
      throw ApiError.conflict('This track is already in the playlist');
    }
    throw err;
  }
}

async function removeTrackFromPlaylist(playlistId, userId, trackId) {
  await assertOwnership(playlistId, userId);

  await prisma.playlistTrack.delete({
    where: { playlistId_trackId: { playlistId, trackId } },
  });
}

async function reorderPlaylist(playlistId, userId, orderedTrackIds) {
  await assertOwnership(playlistId, userId);

  await prisma.$transaction(
    orderedTrackIds.map((trackId, index) =>
      prisma.playlistTrack.update({
        where: { playlistId_trackId: { playlistId, trackId } },
        data: { position: index },
      })
    )
  );

  return getPlaylistById(playlistId, userId);
}

module.exports = {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  updatePlaylist,
  deletePlaylist,
  addTrackToPlaylist,
  removeTrackFromPlaylist,
  reorderPlaylist,
};
