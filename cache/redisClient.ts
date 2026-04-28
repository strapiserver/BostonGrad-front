import { Redis } from "@upstash/redis";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const useRedis = String(process.env.USE_REDIS).toLowerCase() === "true";

let redis: Redis | null = null;
let redisDisabled = false;

const logPrefix = "[upstash]";
const shouldLogRedisDisabled =
  process.env.DEBUG_REDIS === "true" || process.env.DEBUG_REDIS === "1";

if (!useRedis) {
  redisDisabled = true;
  if (shouldLogRedisDisabled && process.env.NODE_ENV !== "test") {
    console.warn(`${logPrefix} Redis disabled via USE_REDIS.`);
  }
} else if (!redisUrl || !redisToken) {
  redisDisabled = true;
  if (shouldLogRedisDisabled && process.env.NODE_ENV !== "test") {
    console.warn(
      `${logPrefix} Redis credentials are missing. Falling back to in-memory fetches.`
    );
  }
} else {
  try {
    redis = new Redis({ url: redisUrl, token: redisToken });
  } catch (error) {
    redisDisabled = true;
    console.error(`${logPrefix} Failed to initialize Redis client:`, error);
  }
}

const markRedisDown = (error: unknown) => {
  if (!redisDisabled) {
    console.error(`${logPrefix} Disabling Redis cache:`, error);
    redisDisabled = true;
  }
};

export const isRedisAvailable = () => !!redis && !redisDisabled;

const withRedis = async <T>(
  action: (client: Redis) => Promise<T>,
  fallback?: T
): Promise<T> => {
  if (!isRedisAvailable()) return fallback as T;
  try {
    return await action(redis!);
  } catch (error) {
    markRedisDown(error);
    return fallback as T;
  }
};

export const redisGet = async <T>(key: string): Promise<T | null> =>
  withRedis((client) => client.get<T>(key), null);

export const redisSet = async <T>(key: string, value: T): Promise<void> => {
  await withRedis((client) => client.set(key, value));
};

export const redisKeys = async (pattern: string): Promise<string[]> =>
  withRedis((client) => client.keys(pattern), []);

export const redisMGet = async (...keys: string[]): Promise<any[]> =>
  withRedis((client) => client.mget(...keys), []);

export const redisExpire = async (key: string, ttlSeconds: number) => {
  await withRedis((client) => client.expire(key, ttlSeconds));
};
