const prisma = require('../config/prisma');
const jiosaavn = require('./jiosaavnService');
const youtube = require('./youtubeService');
const { cacheAside } = require('../utils/cache');

const SEARCH_TTL = 60 * 10; 
const TRACK_TTL = 60 * 60 * 24; 
const POPULAR_TTL = 60 * 30; 

async function upsertTrack(normalizedTrack) {
  return prisma.track.upsert({
    where: { spotifyId: normalizedTrack.spotifyId },
    update: {
      title: normalizedTrack.title,
      artistName: normalizedTrack.artistName,
      albumName: normalizedTrack.albumName,
      durationSecs: normalizedTrack.durationSecs,
      artworkUrl: normalizedTrack.artworkUrl,
      streamUrl: normalizedTrack.streamUrl || null,
      youtubeId: normalizedTrack.youtubeId || null,
      releaseDate: normalizedTrack.releaseDate,
    },
    create: {
      spotifyId: normalizedTrack.spotifyId,
      title: normalizedTrack.title,
      artistName: normalizedTrack.artistName,
      albumName: normalizedTrack.albumName,
      durationSecs: normalizedTrack.durationSecs,
      artworkUrl: normalizedTrack.artworkUrl,
      streamUrl: normalizedTrack.streamUrl || null,
      youtubeId: normalizedTrack.youtubeId || null,
      releaseDate: normalizedTrack.releaseDate,
    },
  });
}

async function searchTracks({ query, limit = 20, offset = 0 }) {
  const cacheKey = `search:tracks:${query}:${limit}:${offset}`;

  const { data } = await cacheAside(cacheKey, SEARCH_TTL, async () => {
    return jiosaavn.searchTracks({ query, limit, offset });
  });

  return data;
}

async function getPopularTracks({ limit = 20, offset = 0 } = {}) {
  const cacheKey = `popular:tracks:${limit}:${offset}`;

  const { data } = await cacheAside(cacheKey, POPULAR_TTL, async () => {
    return jiosaavn.getPopularTracks({ limit, offset });
  });

  return data;
}

async function searchArtists({ query, limit = 20, offset = 0 }) {
  const cacheKey = `search:artists:${query}:${limit}:${offset}`;

  const { data } = await cacheAside(cacheKey, SEARCH_TTL, async () => {
    return jiosaavn.searchArtists({ query, limit, offset });
  });

  return data;
}

async function getTracksByArtist({ artistId, limit = 20, offset = 0 }) {
  const cacheKey = `artist:tracks:${artistId}:${limit}:${offset}`;

  const { data } = await cacheAside(cacheKey, SEARCH_TTL, async () => {
    return jiosaavn.getTracksByArtist({ artistId, limit, offset });
  });

  return data;
}

async function getTrackByInternalId(id) {
  return prisma.track.findUnique({ where: { id } });
}

async function resolveAndCacheTrack(spotifyId) {
  const cacheKey = `track:${spotifyId}`;

  const { data: normalized } = await cacheAside(cacheKey, TRACK_TTL, async () => {
    
    let existing = await prisma.track.findUnique({ where: { spotifyId } });
    if (existing) {
      return {
        spotifyId: existing.spotifyId,
        title: existing.title,
        artistName: existing.artistName,
        albumName: existing.albumName,
        durationSecs: existing.durationSecs,
        artworkUrl: existing.artworkUrl,
        streamUrl: existing.streamUrl,
        youtubeId: existing.youtubeId,
        releaseDate: existing.releaseDate,
      };
    }

    
    const fetched = await jiosaavn.getTrackById(spotifyId);
    return fetched;
  });

  if (!normalized) return null;

  
  if (!normalized.youtubeId) {
    const resolvedYtId = await youtube.searchVideo(normalized.title, normalized.artistName);
    if (resolvedYtId) {
      normalized.youtubeId = resolvedYtId;
    }
  }

  
  if (!normalized.streamUrl) {
    const fetched = await jiosaavn.getTrackById(spotifyId);
    if (fetched && fetched.streamUrl) {
      normalized.streamUrl = fetched.streamUrl;
    }
  }

  
  return upsertTrack(normalized);
}

async function getGenres() {
  return jiosaavn.getGenres();
}

module.exports = {
  searchTracks,
  getPopularTracks,
  searchArtists,
  getTracksByArtist,
  getTrackByInternalId,
  resolveAndCacheTrack,
  getGenres,
  upsertTrack,
};
