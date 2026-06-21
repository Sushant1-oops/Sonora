const playlistService = require('../services/playlistService');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

const create = asyncHandler(async (req, res) => {
  const { name, description, isPublic } = req.body;
  if (!name || !name.trim()) throw ApiError.badRequest('Playlist name is required');

  const playlist = await playlistService.createPlaylist(req.user.id, { name, description, isPublic });
  res.status(201).json({ success: true, data: playlist });
});

const getMine = asyncHandler(async (req, res) => {
  const playlists = await playlistService.getUserPlaylists(req.user.id);
  res.json({ success: true, data: playlists });
});

const getOne = asyncHandler(async (req, res) => {
  const playlist = await playlistService.getPlaylistById(req.params.id, req.user?.id);
  res.json({ success: true, data: playlist });
});

const update = asyncHandler(async (req, res) => {
  const playlist = await playlistService.updatePlaylist(req.params.id, req.user.id, req.body);
  res.json({ success: true, data: playlist });
});

const remove = asyncHandler(async (req, res) => {
  await playlistService.deletePlaylist(req.params.id, req.user.id);
  res.json({ success: true, message: 'Playlist deleted' });
});

const addTrack = asyncHandler(async (req, res) => {
  const { spotifyId } = req.body;
  if (!spotifyId) throw ApiError.badRequest('spotifyId is required');

  const result = await playlistService.addTrackToPlaylist(req.params.id, req.user.id, spotifyId);
  res.status(201).json({ success: true, data: result });
});

const removeTrack = asyncHandler(async (req, res) => {
  await playlistService.removeTrackFromPlaylist(req.params.id, req.user.id, req.params.trackId);
  res.json({ success: true, message: 'Track removed from playlist' });
});

const reorder = asyncHandler(async (req, res) => {
  const { trackIds } = req.body;
  if (!Array.isArray(trackIds) || trackIds.length === 0) {
    throw ApiError.badRequest('trackIds must be a non-empty array');
  }

  const playlist = await playlistService.reorderPlaylist(req.params.id, req.user.id, trackIds);
  res.json({ success: true, data: playlist });
});

module.exports = { create, getMine, getOne, update, remove, addTrack, removeTrack, reorder };
