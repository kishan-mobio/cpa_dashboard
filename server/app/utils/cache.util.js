import redisClient from '../config/redis.config.js';
import { CACHE } from './global.constants.js';

/**
 * @description Get cache
 * @param {String} key - The key
 * @returns {Object} The cache
 */
export const getCache = async (key) => {
  const data = await redisClient.get(key);
  return data ? JSON.parse(data) : null;
};

/**
 * @description Set cache
 * @param {String} key - The key
 * @param {Object} value - The value
 * @param {Number} ttl - The TTL of the cache
 */
export const setCache = async (key, value, ttl = CACHE.EXPIRY) => {
  await redisClient.set(key, JSON.stringify(value), { EX: ttl });
};

/**
 * @description Clear cache
 * @param {String} key - The key
 */
export const clearCache = async (key) => {
  await redisClient.del(key);
};

/**
 * @description Clear all cache
 */
export const clearAllCache = async () => {
  await redisClient.flushAll();
};
