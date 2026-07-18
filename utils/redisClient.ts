import Redis from "ioredis";

const globalForRedis = global as unknown as { redis: Redis };

const redisUrl = process.env.REDIS_URL || process.env.REDIS_HOST || "";
const useUri = redisUrl.startsWith("redis://") || redisUrl.startsWith("rediss://");

const redis =
  globalForRedis.redis ||
  (useUri
    ? new Redis(redisUrl, {
        retryStrategy(times) {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
      })
    : new Redis({
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        retryStrategy(times) {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
      }));

if (process.env.NODE_ENV !== "production") globalForRedis.redis = redis;

redis.on("error", (err) => {
  console.error("Redis Client Error:", err);
});

redis.on("connect", () => {
  console.log("Connected to Redis");
});

export default redis;

