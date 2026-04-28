import {
  isRedisAvailable,
  redisExpire,
  redisGet,
  redisKeys,
  redisMGet,
  redisSet,
} from "./redisClient";

// ------------------ setArray ------------------
export async function setArray<T>(
  key: string,
  data: T[],
  toKey: (item: T) => string,
  ttlSeconds?: number
) {
  if (!isRedisAvailable()) return;
  try {
    const slugs = data.map(toKey);
    await redisSet(key, JSON.stringify(slugs));

    for (const item of data) {
      const slug = toKey(item);
      await redisSet(`${key}:${slug}`, JSON.stringify(item));
      if (ttlSeconds) {
        await redisExpire(`${key}:${slug}`, ttlSeconds);
      }
    }

    if (ttlSeconds) {
      await redisExpire(key, ttlSeconds);
    }
  } catch (error) {
    console.error(`Error setting array for "${key}":`, error);
  }
}

// ------------------ getArray ------------------
export async function getArray(key: string): Promise<any[] | null> {
  try {
    const keys = await redisKeys(`${key}:*`);
    if (!keys?.length) return null;

    // Ensure keys are sorted so array order is preserved
    keys.sort((a, b) => {
      const aIndex = parseInt(a.split(":").pop() || "0", 10);
      const bIndex = parseInt(b.split(":").pop() || "0", 10);
      return aIndex - bIndex;
    });

    const values = await redisMGet(...keys);

    return (values as string[]).map((v) => {
      try {
        return JSON.parse(v);
      } catch {
        return v;
      }
    });
  } catch (error) {
    console.error(`Error retrieving array for key "${key}":`, error);
    return null;
  }
}

// ------------------ getItem ------------------
export async function getItem<T>(key: string, slug: string): Promise<T | null> {
  try {
    const raw = await redisGet<string>(`${key}:${slug}`);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch (error) {
    console.error(`Error retrieving item for "${key}:${slug}":`, error);
    return null;
  }
}
