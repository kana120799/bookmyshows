import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import redis from "@/utils/redisClient";
import Stripe from "stripe";
import { unlockSeats } from "@/utils/redisLock";

export async function POST(req: NextRequest) {
  const { tempBookId } = await req.json();
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  try {
    // Check TempBooking and its expiration
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

    // Verify Redis locks
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

    //  Create confirmed Booking in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.create({
        data: {
          userId: tempBooking.userId,
          showId: tempBooking.showId,
          // status: "CONFIRMED",
          status: "PENDING",
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

      // Create Stripe Payment Intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(tempBooking.total * 100), // Convert to cents
        currency: "usd",
        description: `Booking ${booking.id} for show ${tempBooking.showId}`,
        metadata: {
          userId: tempBooking.userId,
          bookingId: booking.id,
          showId: tempBooking.showId,
        },
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: "never",
        },
      });
      // Create Payment record
      const payment = await tx.payment.create({
        data: {
          bookingId: booking.id,
          amount: tempBooking.total,
          mode: "CARD",
          status: "PENDING",
          paymentIntentId: paymentIntent.id,
          clientSecret: paymentIntent.client_secret,
        },
      });
      await tx.tempBooking.delete({ where: { id: tempBookId } });
      return { booking, payment, clientSecret: paymentIntent.client_secret };
    });

    await unlockSeats(tempBooking.seatIds, tempBooking.showId);

    return NextResponse.json(
      {
        bookingId: result.booking.id,
        paymentId: result.payment.id,
        clientSecret: result.clientSecret,
        amount: tempBooking.total,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Confirm booking error:", error);

    const tempBooking = await prisma.tempBooking.findUnique({
      where: { id: tempBookId },
    });

    if (tempBooking) {
      await unlockSeats(tempBooking.seatIds, tempBooking.showId);
    }

    return NextResponse.json(
      {
        error: "Confirmation failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// handle payment confirmation
export async function PATCH(req: NextRequest) {
  const { paymentId, paymentIntentId } = await req.json();

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    // Verify payment status with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    const updatedPayment = await prisma.$transaction(async (tx) => {
      // Update payment status based on Stripe response
      const paymentStatus =
        paymentIntent.status === "succeeded"
          ? "COMPLETED"
          : paymentIntent.status === "requires_payment_method"
          ? "FAILED"
          : "PENDING";

      const payment = await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: paymentStatus,
          transactionId: paymentIntent.id,
        },
        include: { booking: true },
      });

      // Update booking status if payment succeeded
      if (paymentStatus === "COMPLETED") {
        await tx.booking.update({
          where: { id: payment.bookingId },
          data: { status: "CONFIRMED" },
        });
      }

      return payment;
    });

    return NextResponse.json(
      {
        paymentId: updatedPayment.id,
        status: updatedPayment.status,
        bookingId: updatedPayment.bookingId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Payment confirmation error:", error);
    return NextResponse.json(
      {
        error: "Payment confirmation failed",
      },
      { status: 500 }
    );
  }
}
