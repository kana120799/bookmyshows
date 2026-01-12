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

// Lua script for atomic multi-key locking
const lockSeatsScript = `
  -- First, check if any seats are already locked
  for i, key in ipairs(KEYS) do
    if redis.call('GET', key) ~= false then
      return 0
    end
  end

  -- If all clear, attempt to lock all seats
  for i, key in ipairs(KEYS) do
    redis.call('SET', key, ARGV[1], 'EX', ARGV[2])
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
  const keys = seatIds.map((seatId) => `lock:${showId}:seat:${seatId}`);
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
  const keys = seatIds.map((seatId) => `lock:${showId}:seat:${seatId}`);
  try {
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error("Error unlocking seats:", error);
  }
}

