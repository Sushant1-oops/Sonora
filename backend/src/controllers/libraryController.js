const libraryService = require('../services/libraryService');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');


const likeTrack = asyncHandler(async (req, res) => {
  const { spotifyId } = req.body;
  if (!spotifyId) throw ApiError.badRequest('spotifyId is required');

  const result = await libraryService.likeTrack(req.user.id, spotifyId);
  res.status(201).json({ success: true, data: result });
});

const unlikeTrack = asyncHandler(async (req, res) => {
  await libraryService.unlikeTrack(req.user.id, req.params.trackId);
  res.json({ success: true, message: 'Track unliked' });
});

const getLikedTracks = asyncHandler(async (req, res) => {
  const { limit = 50, offset = 0 } = req.query;
  const liked = await libraryService.getLikedTracks(req.user.id, {
    limit: Math.min(parseInt(limit, 10) || 50, 100),
    offset: parseInt(offset, 10) || 0,
  });
  res.json({ success: true, data: liked });
});


const recordPlay = asyncHandler(async (req, res) => {
  const { spotifyId } = req.body;
  if (!spotifyId) throw ApiError.badRequest('spotifyId is required');

  const track = await libraryService.recordPlay(req.user.id, spotifyId);
  res.status(201).json({ success: true, data: track });
});

const getRecentlyPlayed = asyncHandler(async (req, res) => {
  const { limit = 30 } = req.query;
  const recent = await libraryService.getRecentlyPlayed(req.user.id, {
    limit: Math.min(parseInt(limit, 10) || 30, 50),
  });
  res.json({ success: true, data: recent });
});


const followArtist = asyncHandler(async (req, res) => {
  const { artistName, spotifyArtistId } = req.body;
  if (!artistName) throw ApiError.badRequest('artistName is required');

  const result = await libraryService.followArtist(req.user.id, artistName, spotifyArtistId);
  res.status(201).json({ success: true, data: result });
});

const unfollowArtist = asyncHandler(async (req, res) => {
  await libraryService.unfollowArtist(req.user.id, req.params.artistName);
  res.json({ success: true, message: 'Artist unfollowed' });
});

const getFollowedArtists = asyncHandler(async (req, res) => {
  const artists = await libraryService.getFollowedArtists(req.user.id);
  res.json({ success: true, data: artists });
});

module.exports = {
  likeTrack,
  unlikeTrack,
  getLikedTracks,
  recordPlay,
  getRecentlyPlayed,
  followArtist,
  unfollowArtist,
  getFollowedArtists,
};
