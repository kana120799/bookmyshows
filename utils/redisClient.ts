import Redis from "ioredis";

let redis: Redis | null = null;

export const getRedisClient = (): Redis | null => {
  if (!redis) {
    console.log("Creating new Redis client instance");
    redis = new Redis({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT
        ? parseInt(process.env.REDIS_PORT)
        : undefined,
      password: process.env.REDIS_PASSWORD,
      retryStrategy: (times) => Math.min(times * 50, 2000),
      maxRetriesPerRequest: 3,
      reconnectOnError: (err) => {
        const targetErrors = ["READONLY", "max number of clients reached"];
        return targetErrors.some((targetError) =>
          err.message.includes(targetError)
        );
      },
    });

    redis.on("error", (err) => console.error("Redis connection error:", err));
    redis.on("connect", () => console.log("Redis connected"));
  }
  return redis;
};

// Function to reset the Redis client
export const resetRedisClient = async () => {
  if (redis) {
    await redis.quit();
    redis = null;
    console.log("Redis client reset");
  }
};
// export { redis }; //  singleton instance
