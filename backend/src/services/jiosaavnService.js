const CryptoJS = require('crypto-js');
const ApiError = require('../utils/ApiError');

let Song = null;
let Artist = null;

function decryptSaavnUrl(encryptedUrl) {
  if (!encryptedUrl) return null;
  try {
    const key = CryptoJS.enc.Utf8.parse('38346591');
    const decrypted = CryptoJS.DES.decrypt(encryptedUrl, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    });
    const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
    if (!decryptedText) return null;
    
    return decryptedText.replace('_96', '_320');
  } catch (err) {
    return null;
  }
}

async function getSaavnSdk() {
  if (Song && Artist) return { Song, Artist };
  try {
    const sdk = await import('@saavn-labs/sdk');
    Song = sdk.Song;
    Artist = sdk.Artist;
    return { Song, Artist };
  } catch (err) {
    throw ApiError.internal(`Failed to load JioSaavn SDK: ${err.message}`);
  }
}

function normalizeTrack(t) {
  if (!t) return null;
  
  
  const artwork = t.images?.find((img) => img.resolution === '500x500')?.url || 
                  t.images?.find((img) => img.resolution === '150x150')?.url || 
                  t.images?.[0]?.url || 
                  null;
                  
  const encryptedUrl = t.media?.encryptedUrl;
  const streamUrl = decryptSaavnUrl(encryptedUrl);
                  
  return {
    spotifyId: String(t.id), 
    title: t.title,
    artistName: t.artists?.primary?.map((a) => a.name).join(', ') || 'Unknown Artist',
    albumName: t.album?.title || null,
    durationSecs: t.duration || 0,
    artworkUrl: artwork,
    genre: null,
    streamUrl,
    releaseDate: t.year ? new Date(`${t.year}-01-01`) : null,
  };
}

async function searchTracks({ query, limit = 20, offset = 0 }) {
  const { Song } = await getSaavnSdk();
  const page = Math.floor(offset / limit) || 0;
  
  const results = await Song.search({ query, limit, page });
  const items = results.results || [];
  return items.map(normalizeTrack).filter(Boolean);
}

async function getTrackById(id) {
  const { Song } = await getSaavnSdk();
  const results = await Song.getById({ songIds: id });
  const items = results.songs || [];
  return items.length ? normalizeTrack(items[0]) : null;
}

async function getPopularTracks({ limit = 20, offset = 0 } = {}) {
  
  return searchTracks({ query: 'Trending Hits', limit, offset });
}

async function searchArtists({ query, limit = 20, offset = 0 }) {
  const { Artist } = await getSaavnSdk();
  const page = Math.floor(offset / limit) || 0;
  
  const results = await Artist.search({ query, limit, page });
  const items = results.results || [];
  return items.map((a) => {
    const imageUrl = a.images?.find((img) => img.resolution === '150x150')?.url || 
                     a.images?.[0]?.url || 
                     null;
    return {
      spotifyArtistId: String(a.id),
      name: a.name,
      imageUrl,
    };
  });
}

async function getTracksByArtist({ artistId, limit = 20, offset = 0 }) {
  const { Artist } = await getSaavnSdk();
  const page = Math.floor(offset / limit) || 0;
  const artistDetails = await Artist.getById({ artistId, page, songCount: limit });
  const items = artistDetails?.songs?.top || [];
  return items.map(normalizeTrack).filter(Boolean);
}

async function getGenres() {
  return [
    'bollywood', 'punjabi', 'pop', 'lofi', 'indie',
    'devotional', 'hiphop', 'classical', 'ghazals', 'dance'
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
