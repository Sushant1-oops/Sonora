const YouTube = require('youtube-sr').default;

async function searchVideo(title, artistName) {
  try {
    const query = `${title} ${artistName} audio`;
    const results = await YouTube.search(query, { limit: 1, type: 'video' });
    
    if (results && results.length > 0) {
      const firstResult = results[0];
      return firstResult.id || null;
    }
  } catch (error) {
    console.error('YouTube search error:', error);
  }
  return null;
}

module.exports = {
  searchVideo,
};
