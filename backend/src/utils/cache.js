const redis = require('../config/redis');

async function cacheAside(key, ttlSeconds, fetcher) {
  try {
    const cached = await redis.get(key);
    if (cached) {
      return { data: JSON.parse(cached), fromCache: true };
    }
  } catch (err) {
    
    
    console.error(`[cache] read error for key "${key}":`, err.message);
  }

  const data = await fetcher();

  try {
    await redis.set(key, JSON.stringify(data), 'EX', ttlSeconds);
  } catch (err) {
    console.error(`[cache] write error for key "${key}":`, err.message);
  }

  return { data, fromCache: false };
}

module.exports = { cacheAside };
