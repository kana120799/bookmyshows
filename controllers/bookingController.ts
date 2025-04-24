// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { lockSeats, unlockSeats } from "@/utils/redisLock";
// import redis from "@/utils/redisClient";

// export async function lockBooking({
//   selectedSeatIds,
//   total,
//   userId,
//   showId,
// }: {
//   selectedSeatIds: string[];
//   total: number;
//   userId: string;
//   showId: string;
// }): Promise<NextResponse> {
//   const seatIds = selectedSeatIds;
//   const lockTTL = 600; // 10 minutes

//   try {
//     // Atomically lock all seats in Redis
//     const redisLocked = await lockSeats(seatIds, showId, userId, lockTTL);
//     if (!redisLocked) {
//       return NextResponse.json(
//         { error: "Some seats are already locked by another user" },
//         { status: 409 }
//       );
//     }

//     //  verify and update seat status
//     await prisma.$transaction(async (tx) => {
//       // Check seat availability
//       const seats = await tx.showSeat.findMany({
//         where: {
//           id: { in: seatIds },
//           showId,
//           isReserved: false,
//           status: "AVAILABLE",
//         },
//       });

//       if (seats.length !== seatIds.length) {
//         throw new Error("Some seats are already reserved or unavailable");
//       }

//       // Update ShowSeat status to LOCKED
//       await tx.showSeat.updateMany({
//         where: { id: { in: seatIds } },
//         data: { status: "LOCKED" },
//       });

//       return true;
//     });

//     // temporary booking
//     const tempBooking = await prisma.tempBooking.create({
//       data: {
//         userId,
//         showId,
//         seatIds,
//         total: parseFloat(total.toString()),
//         expiresAt: new Date(Date.now() + lockTTL * 1000),
//       },
//     });

//     return NextResponse.json(
//       {
//         data: {
//           tempBookingId: tempBooking.id,
//           userId,
//           showId,
//           selectedSeatIds,
//           total,
//           createdAt: Date.now(),
//         },
//       },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("Lock booking error:", error);
//     await Promise.all([
//       unlockSeats(seatIds, showId),
//       prisma.showSeat.updateMany({
//         where: { id: { in: seatIds } },
//         data: { status: "AVAILABLE" },
//       }),
//     ]);
//     return NextResponse.json(
//       { error: error instanceof Error ? error.message : "Booking failed" },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { lockSeats, unlockSeats } from "@/utils/redisLock";
// import redis from "@/utils/redisClient";

export async function lockBooking({
  selectedSeatIds,
  total,
  userId,
  showId,
}: {
  selectedSeatIds: string[];
  total: number;
  userId: string;
  showId: string;
}): Promise<NextResponse> {
  const seatIds = selectedSeatIds;
  const lockTTL = 600; // 10 minutes

  // const today = new Date().toISOString().split("T")[0]; // e.g. "2025-04-16"
  // const redisKey = `booking_limit:${userId}:${today}`;
  // const maxDailyBookings = 3;

  try {
    // const count = await redis.incr(redisKey);
    // if (count === 1) {
    //   //  TTL to expire key at end of day
    //   const now = new Date();
    //   const midnight = new Date(now);
    //   midnight.setHours(23, 59, 59, 999);
    //   const secondsUntilMidnight = Math.ceil(
    //     (midnight.getTime() - now.getTime()) / 1000
    //   );
    //   await redis.expire(redisKey, secondsUntilMidnight);
    // }

    // if (count > maxDailyBookings) {
    //   return NextResponse.json(
    //     {
    //       error:
    //         "Daily booking limit exceeded. Max 3 bookings allowed per day.",
    //     },
    //     { status: 429 }
    //   );
    // }
    // Check seat availability first
    const seats = await prisma.showSeat.findMany({
      where: {
        id: { in: seatIds },
        showId,
        isReserved: false,
        status: "AVAILABLE",
      },
    });

    if (seats.length !== seatIds.length) {
      return NextResponse.json(
        { error: "Some seats are already reserved or unavailable" },
        { status: 409 }
      );
    }

    // Atomically lock all seats in Redis
    const redisLocked = await lockSeats(seatIds, showId, userId, lockTTL);
    if (!redisLocked) {
      return NextResponse.json(
        { error: "Some seats are already locked by another user" },
        { status: 409 }
      );
    }

    // Update seat status in transaction
    await prisma.$transaction(async (tx) => {
      // Double-check seats (optional, for extra safety)
      const recheckSeats = await tx.showSeat.findMany({
        where: {
          id: { in: seatIds },
          showId,
          isReserved: false,
          status: "AVAILABLE",
        },
      });

      if (recheckSeats.length !== seatIds.length) {
        throw new Error("Some seats are no longer available");
      }

      // Update ShowSeat status to LOCKED
      await tx.showSeat.updateMany({
        where: { id: { in: seatIds } },
        data: { status: "LOCKED", isReserved: true },
      });
    });

    // Create temporary booking
    const tempBooking = await prisma.tempBooking.create({
      data: {
        userId,
        showId,
        seatIds,
        total: parseFloat(total.toString()),
        expiresAt: new Date(Date.now() + lockTTL * 1000),
      },
    });

    return NextResponse.json(
      {
        tempBookingId: tempBooking.id,
        userId,
        showId,
        selectedSeatIds,
        total,
        createdAt: Date.now(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Lock booking error:", error);
    await Promise.all([
      unlockSeats(seatIds, showId),
      prisma.showSeat.updateMany({
        where: { id: { in: seatIds } },
        data: { status: "AVAILABLE", isReserved: false },
      }),
    ]);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Booking failed" },
      { status: 500 }
    );
  }
}
