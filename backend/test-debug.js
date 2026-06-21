require('dotenv').config();
const musicService = require('./src/services/musicService');

(async () => {
  try {
    const spotifyId = 'BX6n0TPe'; 
    console.log("Resolving track for ID:", spotifyId);
    
    const track = await musicService.resolveAndCacheTrack(spotifyId);
    console.log("Resolved track with streamUrl:", JSON.stringify(track, null, 2));
  } catch (err) {
    console.error("Error resolving track:", err);
  } finally {
    const prisma = require('./src/config/prisma');
    const redis = require('./src/config/redis');
    await prisma.$disconnect();
    redis.disconnect();
  }
})();

