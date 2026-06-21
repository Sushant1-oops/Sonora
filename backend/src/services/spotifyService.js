const ApiError = require('../utils/ApiError');

const BASE = 'https://api.spotify.com/v1';
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

let accessToken = null;
let tokenExpiresAt = 0;

async function getAccessToken() {
  if (accessToken && Date.now() < tokenExpiresAt) {
    return accessToken;
  }

  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw ApiError.internal('Spotify credentials (SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET) are not configured in your backend .env');
  }

  try {
    const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`,
      },
      body: 'grant_type=client_credentials',
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Spotify token error: ${res.statusText} - ${errorText}`);
    }

    const data = await res.json();
    accessToken = data.access_token;
    
    tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;
    return accessToken;
  } catch (err) {
    throw ApiError.internal(`Failed to authenticate with Spotify API: ${err.message}`);
  }
}

async function spotifyFetch(endpoint, params = {}) {
  const token = await getAccessToken();
  const url = new URL(`${BASE}${endpoint}`);
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, value);
    }
  });

  const res = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    if (res.status === 401) {
      
      accessToken = null;
      return spotifyFetch(endpoint, params);
    }
    throw ApiError.internal(`Spotify API returned error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

function normalizeTrack(t) {
  if (!t) return null;
  return {
    spotifyId: String(t.id),
    title: t.name,
    artistName: t.artists ? t.artists.map((a) => a.name).join(', ') : 'Unknown Artist',
    albumName: t.album?.name || null,
    durationSecs: Math.round((t.duration_ms || 0) / 1000),
    artworkUrl: t.album?.images?.[0]?.url || t.album?.images?.[1]?.url || null,
    genre: null, 
    releaseDate: t.album?.release_date ? new Date(t.album.release_date) : null,
  };
}

async function searchTracks({ query, limit = 20, offset = 0 }) {
  const data = await spotifyFetch('/search', {
    q: query,
    type: 'track',
    limit,
    offset,
    market: 'IN',
  });

  const tracks = data.tracks?.items || [];
  return tracks.map(normalizeTrack).filter(Boolean);
}

async function getTrackById(spotifyId) {
  const data = await spotifyFetch(`/tracks/${spotifyId}`, {
    market: 'IN',
  });
  return normalizeTrack(data);
}

async function getPopularTracks({ limit = 20, offset = 0 } = {}) {
  
  const data = await spotifyFetch('/playlists/37i9dQZF1DXcBWIGsyNa7T/items', {
    limit,
    offset,
    market: 'IN',
  });

  const items = data.items || [];
  return items
    .map((item) => normalizeTrack(item.track))
    .filter(Boolean);
}

async function searchArtists({ query, limit = 20, offset = 0 }) {
  const data = await spotifyFetch('/search', {
    q: query,
    type: 'artist',
    limit,
    offset,
    market: 'IN',
  });

  const artists = data.artists?.items || [];
  return artists.map((a) => ({
    spotifyArtistId: String(a.id),
    name: a.name,
    imageUrl: a.images?.[0]?.url || a.images?.[1]?.url || null,
  }));
}

async function getTracksByArtist({ artistId, limit = 20 }) {
  
  const data = await spotifyFetch(`/artists/${artistId}/top-tracks`, {
    market: 'US',
  });

  const tracks = data.tracks || [];
  return tracks.slice(0, limit).map(normalizeTrack).filter(Boolean);
}

async function getGenres() {
  return [
    'pop', 'hiphop', 'rock', 'electronic', 'bollywood', 
    'punjabi', 'jazz', 'classical', 'lofi', 'dance', 'r&b'
  ];
}

module.exports = {
  searchTracks,
  getTrackById,
  getPopularTracks,
  searchArtists,
  getTracksByArtist,
  getGenres,
};
