import { prisma } from "@/lib/prisma";
import { unlockSeats } from "@/utils/redisLock";
import { NextResponse } from "next/server";

interface TempBooking {
  id: string;
  seatIds: string[];
  showId: string;
  expiresAt: Date;
}

async function cleanupExpiredBookings() {
  console.log("Script running...");
  const expiredBookings: TempBooking[] = await prisma.tempBooking.findMany({
    where: { expiresAt: { lt: new Date() } },
  });

  for (const booking of expiredBookings) {
    await prisma.$transaction(async (tx) => {
      await unlockSeats(booking.seatIds, booking.showId);
      await tx.showSeat.updateMany({
        where: { id: { in: booking.seatIds } },
        data: { status: "AVAILABLE" },
      });
      await tx.tempBooking.delete({ where: { id: booking.id } });
    });
    console.log(`Cleaned up expired booking: ${booking.id}`);
  }
}

export async function GET() {
  try {
    await cleanupExpiredBookings();
    return NextResponse.json({ message: "Cleanup completed" }, { status: 200 });
  } catch (error) {
    console.error("Error in cleanup:", error);
    return NextResponse.json({ error: "Cleanup failed" }, { status: 500 });
  }
}
