

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { unlockSeats } from "@/utils/redisLock";
import { revalidateTag } from "next/cache"; // Optional for cache invalidation

interface UserDetails {
  id: string;
  name: string;
  email: string;
  role: "CUSTOMER" | "ADMIN";
}

export async function POST(req: NextRequest) {
  console.log(
    "API /api/stripe/lockpayment called at:",
    new Date().toISOString()
  );

  let tempBookingId: string | undefined;
  let userDetails: UserDetails | undefined;

  try {
    const body = await req.json();
    console.log("Request body:", body);

    if (!body || typeof body !== "object") {
      throw new Error("Invalid request body: Payload must be a JSON object");
    }

    tempBookingId = body.tempBookingId;
    userDetails = body.userDetails;

    if (!tempBookingId || typeof tempBookingId !== "string") {
      throw new Error("Invalid or missing tempBookingId");
    }
    if (!userDetails || typeof userDetails !== "object") {
      throw new Error("Invalid or missing userDetails");
    }
    if (
      !userDetails.id ||
      !userDetails.name ||
      !userDetails.email ||
      !userDetails.role
    ) {
      throw new Error("userDetails must contain id, name, email, and role");
    }

    const result = await prisma.$transaction(async (tx) => {
      const tempBooking = await tx.tempBooking.findUnique({
        where: { id: tempBookingId },
      });
      console.log("AAAAAA", tempBooking);

      if (!tempBooking) {
        throw new Error("Temporary booking not found");
      }

      if (new Date() > tempBooking.expiresAt) {
        throw new Error("Temporary booking has expired");
      }

      await tx.tempBooking.delete({ where: { id: tempBookingId } });
      console.log("BBBB", tempBooking.seatIds, "===>>", tempBooking.showId);

      const seats = await tx.showSeat.findMany({
        where: {
          id: { in: tempBooking.seatIds },
          showId: tempBooking.showId,
          status: "LOCKED",
        },
      });
      console.log("CCCC", seats);

      if (seats.length !== tempBooking.seatIds.length) {
        throw new Error("Some seats are no longer available");
      }
      console.log(
        "DDDDD",
        "==>>",
        tempBooking.showId,
        "==>>",
        tempBooking.seatIds.map((seatId) => ({ showSeatId: seatId })),
        userDetails
      );

      const booking = await tx.booking.create({
        data: {
          userId: userDetails!.id, //non-null assertion operator (!)
          showId: tempBooking.showId,
          status: "PENDING",
          seats: {
            create: tempBooking.seatIds.map((seatId) => ({
              showSeatId: seatId,
            })),
          },
        },
        include: { seats: true },
      });


      const payment = await tx.payment.create({
        data: {
          bookingId: booking.id,
          amount: tempBooking.total,
          mode: "CARD",
          status: "PENDING",
        },
      });

      await tx.showSeat.updateMany({
        where: {
          id: { in: tempBooking.seatIds },
        },
        data: {
          status: "RESERVED",
          isReserved: true,
        },
      });

      return { booking, payment };
    }, {
      maxWait: 5000, // Wait max 5s for the transaction to start
      timeout: 20000 // Allow transaction to run for 20s (fixing P2028 error)
    });

    await unlockSeats(
      result.booking.seats.map((seat) => seat.showSeatId),
      result.booking.showId
    );

    // Optional: Invalidate cache
    await revalidateTag(`seats:${result.booking.showId}`);

    console.log("yes unlock happen");
    return NextResponse.json(
      {
        success: true,
        data: {
          bookingId: result.booking.id,
          paymentId: result.payment.id,
          userDetails,
          showId: result.booking.showId,
          total: result.payment.amount,
          status: result.booking.status,
          paymentStatus: result.payment.status,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("error1", error);
    console.error("Confirm booking error at:", new Date().toISOString(), error);

    if (tempBookingId) {
      const tempBooking = await prisma.tempBooking.findUnique({
        where: { id: tempBookingId },
      });

      if (tempBooking) {
        console.log("Cleaning up temp booking:", tempBookingId);
        await unlockSeats(tempBooking.seatIds, tempBooking.showId);
        await prisma.tempBooking.delete({ where: { id: tempBookingId } });
      }
    }

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Booking confirmation failed",
      },
      { status: 400 }
    );
  }
}
