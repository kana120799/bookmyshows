// import redis from "./redisClient";

// Lua script for atomic multi-key locking
// const lockSeatsScript = `
//   -- First, check if any seats are already locked
//   for i, key in ipairs(KEYS) do
//     if redis.call('GET', key) ~= false then
//       return 0
//     end
//   end

//   -- If all clear, attempt to lock all seats
//   for i, key in ipairs(KEYS) do
//     if redis.call('SET', key, ARGV[1], 'EX', ARGV[2], 'NX') == false then
//       -- If any lock fails, release all previously acquired locks
//       for j = 1, i-1 do
//         redis.call('DEL', KEYS[j])
//       end
//       return 0
//     end
//   end
//   return 1
// `;

// // Function to lock seats atomically
// export async function lockSeats(
//   seatIds: string[],
//   showId: string,
//   userId: string,
//   ttl: number
// ): Promise<boolean> {
//   const keys = seatIds.map((seatId) => `lock:seat:${showId}:${seatId}`);
//   try {
//     const result = await redis.eval(
//       lockSeatsScript,
//       keys.length,
//       ...keys,
//       userId,
//       ttl
//     );
//     return result === 1; // 1 = success, 0 = failure
//   } catch (error) {
//     console.error("Error locking seats:", error);
//     return false;
//   }
// }

// // Function to unlock seats
// export async function unlockSeats(
//   seatIds: string[],
//   showId: string
// ): Promise<void> {
//   const keys = seatIds.map((seatId) => `lock:seat:${showId}:${seatId}`);
//   try {
//     await Promise.all(keys.map((key) => redis.del(key)));
//   } catch (error) {
//     console.error("Error unlocking seats:", error);
//   }
// }

import redis from "./redisClient";

export async function lockSeats(
  seatIds: string[],
  showId: string,
  userId: string,
  ttl: number
): Promise<boolean> {
  const lockKeyPrefix = `lock:${showId}:seat:`;

  try {
    for (const seatId of seatIds) {
      const lockKey = `${lockKeyPrefix}${seatId}`;
      const setResult = await redis.setnx(lockKey, userId);
      if (setResult === 0) {
        // 0 means key already exists
        await unlockSeats(seatIds.slice(0, seatIds.indexOf(seatId)), showId);
        return false;
      }
      await redis.expire(lockKey, ttl);
    }
    return true;
  } catch (error) {
    console.error("Error locking seats:", error);
    await unlockSeats(seatIds, showId);
    return false;
  }
}

export async function unlockSeats(
  seatIds: string[],
  showId: string
): Promise<void> {
  const lockKeyPrefix = `lock:${showId}:seat:`;

  try {
    for (const seatId of seatIds) {
      const lockKey = `${lockKeyPrefix}${seatId}`;
      await redis.del(lockKey);
    }
  } catch (error) {
    console.error("Error unlocking seats:", error);
  }
}
