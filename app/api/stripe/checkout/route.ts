import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
// import redis from "@/utils/redisClient";
import Stripe from "stripe";
import { unlockSeats } from "@/utils/redisLock";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

export async function POST(req: NextRequest) {
  const { tempBookingId, bookingId } = await req.json();

  try {
    // Validate inputs
    if (!tempBookingId || !bookingId)
      throw new Error("Missing required fields");

    // Fetch booking details
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { payment: true },
    });
    if (!booking) throw new Error("Booking not found");

    // Prevent duplicate PaymentIntents
    if (booking.payment?.paymentIntentId) {
      const existingIntent = await stripe.paymentIntents.retrieve(
        booking.payment.paymentIntentId
      );
      return NextResponse.json({
        clientSecret: existingIntent.client_secret,
      });
    }

    // const paymentIntent = await stripe.paymentIntents.create({
    //   amount: Math.round(booking.payment?.amount || 0 * 100),
    //   currency: "usd",
    //   metadata: { bookingId, tempBookingId },
    //   automatic_payment_methods: { enabled: true },
    // });

    const paymentIntent = await stripe.paymentIntents.create({
      // amount: Math.round(tempBooking.total * 100),
      amount: Math.round(booking.payment?.amount || 0 * 100),
      currency: "usd",
      // description: `Booking ${bookingId} for show ${tempBooking.showId}`,
      description: `BookingId ${bookingId}`,
      // metadata: {
      //   userId: tempBooking.userId,
      //   bookingId: bookingId,
      //   showId: tempBooking.showId,
      // },
      metadata: { bookingId, tempBookingId },
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: "never",
      },
      shipping: {
        name: "Random singh",
        address: {
          line1: "510 Townsend St",
          postal_code: "98140",
          city: "San Francisco",
          state: "CA",
          country: "US",
        },
      },
    });

    await prisma.payment.update({
      where: { bookingId },
      data: {
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
      },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Stripe Checkout Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Payment failed" },
      { status: 400 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const { paymentId, paymentIntentId } = await req.json();

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: paymentIntent.status === "succeeded" ? "COMPLETED" : "FAILED",
          transactionId: paymentIntent.id,
        },
      });

      if (paymentIntent.status === "succeeded") {
        await tx.booking.update({
          where: { id: payment.bookingId },
          data: { status: "CONFIRMED" },
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Payment Confirmation Error:", error);
    return NextResponse.json(
      { error: "Payment confirmation failed" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const { bookingId, paymentId, tempBookingId } = await req.json();

  try {
    console.log("AAAAA", bookingId, "==>>>", paymentId, "===>", tempBookingId);
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { payment: true, seats: { include: { showSeat: true } } },
    });
    console.log("BBBBB", booking);

    if (!booking || booking.status === "CONFIRMED") {
      return NextResponse.json(
        { error: "Booking not found or already confirmed" },
        { status: 400 }
      );
    }

    const seatIds = booking.seats.map((seat) => seat.showSeatId);
    const showId = booking.showId;
    console.log("CCC", seatIds, "==>>>", showId);

    await prisma.$transaction(async (tx) => {
      // Update seats back to AVAILABLE
      console.log("ASDDDDDDD", seatIds);

      await tx.showSeat.updateMany({
        where: { id: { in: seatIds } },
        data: { isReserved: false, status: "AVAILABLE" },
      });
      console.log("DDDDD", paymentId);

      // Delete payment record
      await tx.payment.delete({
        where: { id: paymentId },
      });
      console.log("EEEE", bookingId);

      // Update booking status to CANCELED
      await tx.booking.update({
        where: { id: bookingId },
        data: { status: "CANCELED" },
      });

      console.log("FFFF");

      // If tempBooking still exists
      const tempBooking = await tx.tempBooking.findUnique({
        where: { id: tempBookingId },
      });
      console.log("GGGGG", tempBooking);

      if (tempBooking) {
        await tx.tempBooking.delete({ where: { id: tempBookingId } });
      }
    });

    // Release Redis locks
    await unlockSeats(seatIds, showId);

    return NextResponse.redirect(
      new URL(`/payment-failure?bookingId=${bookingId}`, req.url),
      303
    );
  } catch (error) {
    console.error("Cancellation error:", error);
    return NextResponse.json(
      {
        error: "Cancellation failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// export async function POST(req: NextRequest) {
//   let tempBookingId: string | undefined;
//   let bookingId: string | undefined;

//   try {
//     const body = await req.json();
//     tempBookingId = body.tempBookingId;
//     bookingId = body.bookingId;

//     // Validate inputs
//     if (!tempBookingId || !bookingId) {
//       throw new Error("tempBookingId and bookingId are required");
//     }

//     // Fetch tempBooking
//     const tempBooking = await prisma.tempBooking.findUnique({
//       where: { id: tempBookingId },
//     });
//     if (!tempBooking) {
//       throw new Error("Temporary booking not found");
//     }

//     // Create PaymentIntent
//     const paymentIntent = await stripe.paymentIntents.create({
//       amount: Math.round(tempBooking.total * 100),
//       currency: "usd",
//       description: `Booking ${bookingId} for show ${tempBooking.showId}`,
//       metadata: {
//         userId: tempBooking.userId,
//         bookingId: bookingId,
//         showId: tempBooking.showId,
//       },
//       automatic_payment_methods: {
//         enabled: true,
//         allow_redirects: "never",
//       },
//       shipping: {
//         name: "Random singh",
//         address: {
//           line1: "510 Townsend St",
//           postal_code: "98140",
//           city: "San Francisco",
//           state: "CA",
//           country: "US",
//         },
//       },
//     });

//     // Save payment to database
//     await prisma.payment.update({
//       where: { bookingId: bookingId },
//       data: {
//         paymentIntentId: paymentIntent.id,
//         clientSecret: paymentIntent.client_secret,
//         status: "PENDING",
//       },
//     });

//     return NextResponse.json(
//       {
//         success: true,
//         clientSecret: paymentIntent.client_secret,
//       },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("Confirm booking error at:", new Date().toISOString(), error);

//     if (tempBookingId) {
//       const tempBooking = await prisma.tempBooking.findUnique({
//         where: { id: tempBookingId },
//       });
//       if (tempBooking) {
//         await unlockSeats(tempBooking.seatIds, tempBooking.showId);
//         await prisma.tempBooking.delete({ where: { id: tempBookingId } });
//       }
//     }

//     return NextResponse.json(
//       {
//         success: false,
//         error:
//           error instanceof Error
//             ? error.message
//             : "Booking confirmation failed",
//       },
//       { status: 400 }
//     );
//   }
// }

// export async function PATCH(req: NextRequest) {
//   const { paymentId, paymentIntentId } = await req.json();
//   console.log("AAAAA", paymentId, paymentIntentId);
//   try {
//     const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//       apiVersion: "2025-02-24.acacia",
//     });
//     // Verify payment status with Stripe
//     const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

//     console.log("BBBBBBB", paymentIntent, paymentIntent.status);

//     const updatedPayment = await prisma.$transaction(async (tx) => {
//       // Update payment status based on Stripe response
//       const paymentStatus =
//         paymentIntent.status === "succeeded"
//           ? "COMPLETED"
//           : paymentIntent.status === "requires_payment_method"
//           ? "FAILED"
//           : "PENDING";

//       console.log("CCCCC", paymentStatus, paymentIntent.id);

//       const payment = await tx.payment.update({
//         where: { id: paymentId },
//         data: {
//           status: paymentStatus,
//           transactionId: paymentIntent.id,
//         },
//         include: { booking: true },
//       });
//       console.log("DDDDD", payment);

//       // Update booking status if payment succeeded
//       if (paymentStatus === "COMPLETED") {
//         await tx.booking.update({
//           where: { id: payment.bookingId },
//           data: { status: "CONFIRMED" },
//         });
//       }

//       return payment;
//     });

//     return NextResponse.json(
//       {
//         paymentId: updatedPayment.id,
//         status: updatedPayment.status,
//         bookingId: updatedPayment.bookingId,
//       },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("Payment confirmation error:", error);
//     return NextResponse.json(
//       {
//         error: "Payment confirmation failed",
//       },
//       { status: 500 }
//     );
//   }
// }
