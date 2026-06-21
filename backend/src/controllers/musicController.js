const musicService = require('../services/musicService');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

const search = asyncHandler(async (req, res) => {
  const { q, type = 'tracks', genre, limit = 20, offset = 0 } = req.query;

  if (!q || !q.trim()) {
    throw ApiError.badRequest('Query parameter "q" is required');
  }

  const parsedLimit = Math.min(parseInt(limit, 10) || 20, 50);
  const parsedOffset = parseInt(offset, 10) || 0;

  let results;
  if (type === 'artists') {
    results = await musicService.searchArtists({ query: q, limit: parsedLimit, offset: parsedOffset });
  } else {
    results = await musicService.searchTracks({
      query: q,
      genre,
      limit: parsedLimit,
      offset: parsedOffset,
    });
  }

  res.json({ success: true, data: results });
});

const getPopular = asyncHandler(async (req, res) => {
  const { genre, limit = 20, offset = 0 } = req.query;
  const parsedLimit = Math.min(parseInt(limit, 10) || 20, 50);
  const parsedOffset = parseInt(offset, 10) || 0;

  const results = await musicService.getPopularTracks({
    genre,
    limit: parsedLimit,
    offset: parsedOffset,
  });

  res.json({ success: true, data: results });
});

const getArtistTracks = asyncHandler(async (req, res) => {
  const { artistId } = req.params;
  const { limit = 20, offset = 0 } = req.query;

  const results = await musicService.getTracksByArtist({
    artistId,
    limit: Math.min(parseInt(limit, 10) || 20, 50),
    offset: parseInt(offset, 10) || 0,
  });

  res.json({ success: true, data: results });
});



const getTrack = asyncHandler(async (req, res) => {
  const { spotifyId } = req.params;
  const track = await musicService.resolveAndCacheTrack(spotifyId);

  if (!track) {
    throw ApiError.notFound('Track not found');
  }

  res.json({ success: true, data: track });
});

const getGenres = asyncHandler(async (req, res) => {
  const genres = await musicService.getGenres();
  res.json({ success: true, data: genres });
});

module.exports = { search, getPopular, getArtistTracks, getTrack, getGenres };
