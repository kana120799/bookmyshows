import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { unlockSeats } from "@/utils/redisLock";

export async function POST(req: NextRequest) {
    try {
        const { bookingId, tempBookingId } = await req.json();

        if (!bookingId) {
            return NextResponse.json({ error: "Booking ID is required" }, { status: 400 });
        }

        console.log("Processing cancellation for Booking:", bookingId);

        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: { seats: true }
        });

        if (!booking || booking.status === "CONFIRMED") {
            // Already confirmed or doesn't exist, nothing to cancel (or too late)
            return NextResponse.json({ message: "Booking already confirmed or not found" }, { status: 200 });
        }

        const seatIds = booking.seats.map((seat) => seat.showSeatId);
        const showId = booking.showId;

        await prisma.$transaction(async (tx) => {
            // 1. Release Seats in DB
            await tx.showSeat.updateMany({
                where: { id: { in: seatIds } },
                data: { isReserved: false, status: "AVAILABLE" },
            });

            // 2. Mark Booking as CANCELED
            await tx.booking.update({
                where: { id: bookingId },
                data: { status: "CANCELED" }
            });

            // 3. Mark Payment as FAILED (if exists)
            // We can check if payment exists but updateMany is safe
            await tx.payment.updateMany({
                where: { bookingId: bookingId },
                data: { status: "FAILED" }
            });

            // 4. Cleanup Temp Booking if matches (optional but good)
            if (tempBookingId) {
                // Check if it exists first to avoid error? deleteMany is safe for "if exists" logic usually but delete throws if not found
                // usage deleteMany to be safe
                await tx.tempBooking.deleteMany({
                    where: { id: tempBookingId }
                });
            }
        });

        // 5. Release Redis Locks
        if (seatIds.length > 0) {
            await unlockSeats(seatIds, showId);
        }

        return NextResponse.json({ success: true, message: "Booking cancelled successfully" });
    } catch (error: any) {
        console.error("Cancellation error:", error);
        return NextResponse.json(
            { error: "Cancellation failed", details: error.message },
            { status: 500 }
        );
    }
}
