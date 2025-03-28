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
  const lockTTL = 300; // 5 minutes

  try {
    // Step 1: Check seat availability in database
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

    // Step 2: Atomically lock all seats in Redis
    const locked = await lockSeats(seatIds, showId, userId, lockTTL);
    if (!locked) {
      return NextResponse.json(
        { error: "Some seats are already booked by another user" },
        { status: 409 }
      );
    }

    // Step 3: Create a TempBooking record
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
        data: {
          tempBookingId: tempBooking.id,
          userId,
          showId,
          selectedSeatIds,
          total,
          createdAt: Date.now(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Lock booking error:", error);
    // Cleanup locks on failure
    await unlockSeats(seatIds, showId);
    return NextResponse.json({ error: "Booking failed" }, { status: 500 });
  }
}
