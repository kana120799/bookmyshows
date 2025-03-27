import Redis from "ioredis";

let redis: Redis | null = null;

export const initializeRedisClient = async (): Promise<Redis> => {
  if (!redis) {
    console.log("Creating new Redis client instance");
    redis = new Redis({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT
        ? parseInt(process.env.REDIS_PORT)
        : undefined,
      password: process.env.REDIS_PASSWORD,
      retryStrategy: (times: number) => Math.min(times * 50, 2000),
      maxRetriesPerRequest: 3,
      reconnectOnError: (err: Error) => {
        const targetErrors = ["READONLY", "max number of clients reached"];
        return targetErrors.some((targetError) =>
          err.message.includes(targetError)
        );
      },
    });

    redis.on("error", (err: Error) =>
      console.error("Redis connection error:", err)
    );
    redis.on("connect", () => console.log("Redis connected"));

    // Wait for the "ready" event to ensure the client is fully initialized
    await new Promise<void>((resolve) => redis!.once("ready", resolve));
  }
  return redis;
};

// Reset Redis client if needed
export const resetRedisClient = async (): Promise<void> => {
  if (redis) {
    await redis.quit();
    redis = null;
    console.log("Redis client reset");
  }
};
// export { redis }; //  singleton instance
