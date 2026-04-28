// scripts/clearRedis.js

const { Redis } = require("@upstash/redis");
require("dotenv").config(); // load env vars

const useRedis = String(process.env.USE_REDIS).toLowerCase() === "true";
if (!useRedis) {
  console.log("ℹ️ USE_REDIS is false. Skipping Redis cleanup.");
  process.exit(0);
}

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

async function clearAllKeys() {
  try {
    let cursor = "0";
    let totalDeleted = 0;

    do {
      const [nextCursor, keys] = await redis.scan(cursor, { count: 100 }); // Get up to 100 keys at a time
      cursor = nextCursor;

      if (keys.length > 0) {
        await Promise.all(keys.map((key) => redis.del(key)));
        totalDeleted += keys.length;
        console.log(`🗑 Deleted ${keys.length} keys`);
      }
    } while (cursor !== "0");

    console.log(`✅ Redis cache cleared (${totalDeleted} keys removed)`);
  } catch (err) {
    console.error("❌ Failed to clear Redis cache:", err);
    process.exit(1);
  }
}

clearAllKeys();
