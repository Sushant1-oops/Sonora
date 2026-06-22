const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const musicService = require('./musicService');

const RECENTLY_PLAYED_LIMIT = 50; 



async function likeTrack(userId, spotifyId) {
  const track = await musicService.resolveAndCacheTrack(spotifyId);
  if (!track) throw ApiError.notFound('Track not found');

  try {
    return await prisma.likedTrack.create({
      data: { userId, trackId: track.id },
      include: { track: true },
    });
  } catch (err) {
    if (err.code === 'P2002') {
      throw ApiError.conflict('Track already liked');
    }
    throw err;
  }
}

async function unlikeTrack(userId, trackIdOrSpotifyId) {
  // Check if trackIdOrSpotifyId is a spotifyId (string matching external ID)
  const track = await prisma.track.findUnique({
    where: { spotifyId: trackIdOrSpotifyId },
  });

  const trackId = track ? track.id : trackIdOrSpotifyId;

  await prisma.likedTrack
    .delete({ where: { userId_trackId: { userId, trackId } } })
    .catch(async () => {
      // Fallback: in case trackIdOrSpotifyId was the trackId itself
      if (track && track.id !== trackIdOrSpotifyId) {
        await prisma.likedTrack
          .delete({ where: { userId_trackId: { userId, trackId: trackIdOrSpotifyId } } })
          .catch(() => {
            throw ApiError.notFound('Liked track not found');
          });
      } else {
        throw ApiError.notFound('Liked track not found');
      }
    });
}

async function getLikedTracks(userId, { limit = 50, offset = 0 } = {}) {
  return prisma.likedTrack.findMany({
    where: { userId },
    orderBy: { likedAt: 'desc' },
    take: limit,
    skip: offset,
    include: { track: true },
  });
}

async function isTrackLiked(userId, trackId) {
  const like = await prisma.likedTrack.findUnique({
    where: { userId_trackId: { userId, trackId } },
  });
  return !!like;
}



async function recordPlay(userId, spotifyId) {
  const track = await musicService.resolveAndCacheTrack(spotifyId);
  if (!track) throw ApiError.notFound('Track not found');

  await prisma.recentlyPlayed.create({ data: { userId, trackId: track.id } });

  
  const excess = await prisma.recentlyPlayed.findMany({
    where: { userId },
    orderBy: { playedAt: 'desc' },
    skip: RECENTLY_PLAYED_LIMIT,
    select: { id: true },
  });

  if (excess.length > 0) {
    await prisma.recentlyPlayed.deleteMany({
      where: { id: { in: excess.map((e) => e.id) } },
    });
  }

  return track;
}

async function getRecentlyPlayed(userId, { limit = 30 } = {}) {
  return prisma.recentlyPlayed.findMany({
    where: { userId },
    orderBy: { playedAt: 'desc' },
    take: limit,
    include: { track: true },
  });
}



async function followArtist(userId, artistName, spotifyArtistId) {
  try {
    return await prisma.followedArtist.create({
      data: { userId, artistName, spotifyArtistId },
    });
  } catch (err) {
    if (err.code === 'P2002') {
      throw ApiError.conflict('Already following this artist');
    }
    throw err;
  }
}

async function unfollowArtist(userId, artistName) {
  await prisma.followedArtist
    .delete({ where: { userId_artistName: { userId, artistName } } })
    .catch(() => {
      throw ApiError.notFound('Not following this artist');
    });
}

async function getFollowedArtists(userId) {
  return prisma.followedArtist.findMany({
    where: { userId },
    orderBy: { followedAt: 'desc' },
  });
}

module.exports = {
  likeTrack,
  unlikeTrack,
  getLikedTracks,
  isTrackLiked,
  recordPlay,
  getRecentlyPlayed,
  followArtist,
  unfollowArtist,
  getFollowedArtists,
};
