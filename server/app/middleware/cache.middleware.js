import { getCache, setCache } from '../utils/cache.util.js';
import { CACHE } from '../utils/global.constants.js';

/**
 * @description Cache middleware
 * @param {Function} keyGenerator - The key generator function
 * @param {Number} ttl - The TTL of the cache
 * @returns {Function} The middleware function
 */
const cacheMiddleware = (keyGenerator, ttl) => async (req, res, next) => {
  const key = keyGenerator(req);
  const cachedData = await getCache(key);

  if (cachedData) {
    return res.json({ source: CACHE.KEY, data: cachedData });
  }

  const originalJson = res.json.bind(res);
  res.json = async (body) => {
    await setCache(key, body, ttl);
    originalJson(body);
  };

  next();
};

export default cacheMiddleware;
