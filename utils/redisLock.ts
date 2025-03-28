import redis from "./redisClient";

// Lua script for atomic multi-key locking
const lockSeatsScript = `
  local locks = {}
  for i, key in ipairs(KEYS) do
    if redis.call('SET', key, ARGV[1], 'EX', ARGV[2], 'NX') then
      table.insert(locks, key)
    else
      for j, lockedKey in ipairs(locks) do
        redis.call('DEL', lockedKey)
      end
      return 0
    end
  end
  return 1
`;

// Function to lock seats atomically
export async function lockSeats(
  seatIds: string[],
  showId: string,
  userId: string,
  ttl: number
): Promise<boolean> {
  const keys = seatIds.map((seatId) => `lock:seat:${showId}:${seatId}`);
  try {
    const result = await redis.eval(
      lockSeatsScript,
      keys.length,
      ...keys,
      userId,
      ttl
    );
    return result === 1; // 1 = success, 0 = failure
  } catch (error) {
    console.error("Error locking seats:", error);
    return false;
  }
}

// Function to unlock seats
export async function unlockSeats(
  seatIds: string[],
  showId: string
): Promise<void> {
  const keys = seatIds.map((seatId) => `lock:seat:${showId}:${seatId}`);
  try {
    await Promise.all(keys.map((key) => redis.del(key)));
  } catch (error) {
    console.error("Error unlocking seats:", error);
  }
}
