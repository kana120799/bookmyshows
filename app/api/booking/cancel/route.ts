import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { stripe } from "@/lib/stripe";
import { handleError } from "@/middleware/errorHandler";

export const POST = handleError(async (req: NextRequest) => {
    const session = await auth();
    if (!session || !session.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bookingId } = await req.json();

    if (!bookingId) {
        return NextResponse.json(
            { error: "Booking ID is required" },
            { status: 400 }
        );
    }

    // Fetch booking details including payment and show info
    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
            user: true,
            payment: true,
            show: true,
            seats: true,
        },
    });

    if (!booking) {
        return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Verify ownership
    if (booking.userId !== session.user.id) {
        return NextResponse.json(
            { error: "You are not authorized to cancel this booking" },
            { status: 403 }
        );
    }

    // Check if already canceled
    if (booking.status === "CANCELED") {
        return NextResponse.json(
            { error: "Booking is already canceled" },
            { status: 400 }
        );
    }

    // Check 2-hour cancellation window
    const showTime = new Date(booking.show.startTime);
    const currentTime = new Date();
    const timeDifference = showTime.getTime() - currentTime.getTime();
    const hoursDifference = timeDifference / (1000 * 60 * 60);

    if (hoursDifference < 2) {
        return NextResponse.json(
            { error: "Cancellation is only allowed up to 2 hours before the show" },
            { status: 400 }
        );
    }

    // Process Stripe Refund if payment exists and was successful
    if (booking.payment && booking.payment.paymentIntentId && booking.payment.status === "COMPLETED") {
        try {
            await stripe.refunds.create({
                payment_intent: booking.payment.paymentIntentId,
            });
            // Update payment status
            await prisma.payment.update({
                where: { id: booking.payment.id },
                data: { status: "CANCELED" },
            });
        } catch (error: any) {
            console.error("Stripe Refund Error:", error);
            return NextResponse.json(
                { error: "Failed to process refund. Please contact support." },
                { status: 500 }
            );
        }
    }

    // Transaction to update booking and seats
    // Transaction to update booking and seats
    await prisma.$transaction(async (tx: any) => {
        // 1. Update Booking Status
        await tx.booking.update({
            where: { id: bookingId },
            data: { status: "CANCELED" },
        });

        // 2. Release Seats
        const showSeatIds = booking.seats.map((s: any) => s.showSeatId);
        if (showSeatIds.length > 0) {
            await tx.showSeat.updateMany({
                where: { id: { in: showSeatIds } },
                data: { status: "AVAILABLE", isReserved: false },
            });
        }
    });

    return NextResponse.json(
        { message: "Booking canceled and refund initiated successfully" },
        { status: 200 }
    );
});
