







const ApiError = require('../utils/ApiError');

const BASE = process.env.JAMENDO_API_BASE || 'https://api.jamendo.com/v3.0';
const CLIENT_ID = process.env.JAMENDO_CLIENT_ID;

async function jamendoFetch(endpoint, params = {}) {
  if (!CLIENT_ID) {
    throw ApiError.internal('Jamendo client ID is not configured on the server');
  }

  const url = new URL(`${BASE}${endpoint}`);
  url.searchParams.set('client_id', CLIENT_ID);
  url.searchParams.set('format', 'json');
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) url.searchParams.set(key, value);
  });

  const res = await fetch(url.toString());

  if (!res.ok) {
    throw ApiError.internal(`Jamendo API error: ${res.status}`);
  }

  const data = await res.json();

  if (data.headers?.status === 'failed') {
    throw ApiError.internal(data.headers.error_message || 'Jamendo API returned an error');
  }

  return data.results || [];
}



function normalizeTrack(t) {
  return {
    jamendoId: String(t.id),
    title: t.name,
    artistName: t.artist_name,
    albumName: t.album_name || null,
    durationSecs: t.duration || 0,
    artworkUrl: t.album_image || t.image || null,
    streamUrl: t.audio,
    genre: t.musicinfo?.tags?.genres?.[0] || null,
    releaseDate: t.releasedate ? new Date(t.releasedate) : null,
  };
}

async function searchTracks({ query, limit = 20, offset = 0, genre, order = 'popularity_total' }) {
  const results = await jamendoFetch('/tracks/', {
    search: query,
    limit,
    offset,
    order,
    tags: genre,
    include: 'musicinfo',
    audioformat: 'mp32',
  });

  return results.map(normalizeTrack);
}

async function getTrackById(jamendoId) {
  const results = await jamendoFetch('/tracks/', {
    id: jamendoId,
    include: 'musicinfo',
    audioformat: 'mp32',
  });

  return results.length ? normalizeTrack(results[0]) : null;
}

async function getPopularTracks({ limit = 20, offset = 0, genre } = {}) {
  const results = await jamendoFetch('/tracks/', {
    order: 'popularity_total',
    limit,
    offset,
    tags: genre,
    include: 'musicinfo',
    audioformat: 'mp32',
  });

  return results.map(normalizeTrack);
}

async function searchArtists({ query, limit = 20, offset = 0 }) {
  const results = await jamendoFetch('/artists/', {
    search: query,
    limit,
    offset,
    order: 'popularity_total',
  });

  return results.map((a) => ({
    jamendoArtistId: String(a.id),
    name: a.name,
    imageUrl: a.image || null,
  }));
}

async function getTracksByArtist({ artistId, limit = 20, offset = 0 }) {
  const results = await jamendoFetch('/tracks/', {
    artist_id: artistId,
    limit,
    offset,
    order: 'popularity_total',
    include: 'musicinfo',
    audioformat: 'mp32',
  });

  return results.map(normalizeTrack);
}

async function getGenres() {
  
  
  
  return [
    'rock', 'pop', 'jazz', 'classical', 'electronic', 'hiphop',
    'metal', 'folk', 'blues', 'reggae', 'soundtrack', 'ambient',
    'world', 'lounge', 'funk', 'punk',
  ];
}

module.exports = {
  searchTracks,
  getTrackById,
  getPopularTracks,
  searchArtists,
  getTracksByArtist,
  getGenres,
  normalizeTrack,
};
