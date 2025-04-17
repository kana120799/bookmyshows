import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { unlockSeats } from "@/utils/redisLock";

let isCleanupRunning = false;

export async function GET(request: Request) {
  const apiKey = request.headers.get("x-api-key");
  if (apiKey !== process.env.CLEANUP_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (isCleanupRunning) {
    return NextResponse.json({ message: "Cleanup already in progress" });
  }

  isCleanupRunning = true;
  try {
    const expiredBookings = await prisma.tempBooking.findMany({
      where: { expiresAt: { lt: new Date() } },
    });

    if (expiredBookings.length === 0) {
      return NextResponse.json({ message: "No expired bookings found" });
    }

    for (const booking of expiredBookings) {
      try {
        await prisma.$transaction(async (tx) => {
          await unlockSeats(booking.seatIds, booking.showId);
          await tx.showSeat.updateMany({
            where: { id: { in: booking.seatIds } },
            data: { status: "AVAILABLE" },
          });
          const existingBooking = await tx.tempBooking.findUnique({
            where: { id: booking.id },
          });
          if (existingBooking) {
            await tx.tempBooking.delete({ where: { id: booking.id } });
            console.log(`Cleaned up expired booking: ${booking.id}`);
          }
        });
      } catch (error) {
        console.error(`Error cleaning up booking ${booking.id}:`, error);
      }
    }
    return NextResponse.json({ message: "Cleanup completed" });
  } catch (error) {
    console.error("Error in cleanupExpiredBookings:", error);
    return NextResponse.json({ error: "Cleanup failed" }, { status: 500 });
  } finally {
    isCleanupRunning = false;
  }
}
