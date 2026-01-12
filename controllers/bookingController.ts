

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { lockSeats, unlockSeats } from "@/utils/redisLock";

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

    // Transaction: Update seat status AND create temp booking
    const result = await prisma.$transaction(async (tx) => {
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
      // Update ShowSeat status to LOCKED ATOMICALLY
      // We purposefully rely on updateMany returning count.
      // We ONLY update if status is 'AVAILABLE'.
      const updateResult = await tx.showSeat.updateMany({
        where: {
          id: { in: seatIds },
          status: "AVAILABLE",
          isReserved: false
        },
        data: { status: "LOCKED", isReserved: true },
      });

      if (updateResult.count !== seatIds.length) {
        throw new Error("Race condition detected: Some seats were taken just now.");
      }

      // Create temporary booking
      const tempBooking = await tx.tempBooking.create({
        data: {
          userId,
          showId,
          seatIds,
          total: parseFloat(total.toString()),
          expiresAt: new Date(Date.now() + lockTTL * 1000),
        },
      });

      return tempBooking;
    });

    return NextResponse.json(
      {
        tempBookingId: result.id,
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
    // Only need to release Redis locks, DB is rolled back by transaction
    await unlockSeats(seatIds, showId);

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Booking failed" },
      { status: 500 }
    );
  }
}
