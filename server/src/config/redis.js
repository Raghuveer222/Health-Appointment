const Redis = require('ioredis');

let redisClient = null;
let isRedisAvailable = false;

const initRedis = () => {
  if (redisClient) return { redisClient, isRedisAvailable };

  const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
  
  try {
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      retryStrategy(times) {
        if (times > 3) {
          console.warn('[Redis] Connection failed after 3 retries. Falling back to internal async worker queue.');
          return null; // Stop retrying
        }
        return Math.min(times * 200, 1000);
      },
      lazyConnect: true
    });

    redisClient.on('connect', () => {
      isRedisAvailable = true;
      console.log('[Redis] Connected successfully.');
    });

    redisClient.on('error', (err) => {
      isRedisAvailable = false;
      // Silent warning to avoid cluttering logs when Redis is intentionally not installed
    });

    // Try connecting asynchronously
    redisClient.connect().catch(() => {
      isRedisAvailable = false;
      console.log('[Redis] Not available locally. In-memory job fallback active.');
    });
  } catch (err) {
    isRedisAvailable = false;
    console.log('[Redis] Not available locally. In-memory job fallback active.');
  }

  return { redisClient, isRedisAvailable };
};

const getRedisStatus = () => isRedisAvailable;

module.exports = { initRedis, getRedisStatus };
