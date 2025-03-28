import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import redis from "@/utils/redisClient";
import { unlockSeats } from "@/utils/redisLock";

export async function POST(req: NextRequest) {
  const { tempBookId } = await req.json();

  try {
    // Step 1: Check TempBooking and its expiration
    const tempBooking = await prisma.tempBooking.findUnique({
      where: { id: tempBookId },
    });

    if (!tempBooking || tempBooking.expiresAt < new Date()) {
      if (tempBooking) {
        await unlockSeats(tempBooking.seatIds, tempBooking.showId);
        await prisma.tempBooking.delete({ where: { id: tempBookId } });
      }
      return NextResponse.json({ error: "Booking expired" }, { status: 410 });
    }

    // Step 2: Verify Redis locks
    const lockChecks = await Promise.all(
      tempBooking.seatIds.map((seatId) =>
        redis.get(`lock:seat:${tempBooking.showId}:${seatId}`)
      )
    );

    if (lockChecks.some((lock) => lock !== tempBooking.userId)) {
      await unlockSeats(tempBooking.seatIds, tempBooking.showId);
      await prisma.tempBooking.delete({ where: { id: tempBookId } });
      return NextResponse.json(
        { error: "Seats no longer reserved by you" },
        { status: 409 }
      );
    }

    // Step 3: Create confirmed Booking in a transaction
    const booking = await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.create({
        data: {
          userId: tempBooking.userId,
          showId: tempBooking.showId,
          status: "CONFIRMED",
          seats: {
            create: tempBooking.seatIds.map((seatId) => ({
              showSeatId: seatId,
            })),
          },
        },
      });

      await tx.showSeat.updateMany({
        where: { id: { in: tempBooking.seatIds } },
        data: { isReserved: true, status: "RESERVED" },
      });

      await tx.tempBooking.delete({ where: { id: tempBookId } });
      return booking;
    });

    // Step 4: Release Redis locks
    await unlockSeats(tempBooking.seatIds, tempBooking.showId);

    return NextResponse.json({ bookingId: booking.id }, { status: 200 });
  } catch (error) {
    console.error("Confirm booking error:", error);
    return NextResponse.json({ error: "Confirmation failed" }, { status: 500 });
  }
}
