import Redis from "ioredis";

export const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : undefined,
  password: process.env.REDIS_PASSWORD,
});
redis.on("error", (err) => console.error("Redis connection error:", err));
redis.on("connect", () => console.error("Redis connected"));
