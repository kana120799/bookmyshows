// import { dbQueryDuration, dbQueryErrors, userSeatLock } from "@/lib/metrics";
import { prisma } from "@/lib/prisma";
import { getRedisClient, resetRedisClient } from "@/utils/redisClient";
const redis = getRedisClient();
import { NextResponse } from "next/server";
// import { Resend } from "resend";
import nodemailer from "nodemailer";
import Stripe from "stripe";

// Retry mechanism for Redis operations with proper typing
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (err) {
      if (
        err instanceof Error &&
        (err.message.includes("max number of clients reached") ||
          err.message.includes("ECONNRESET") ||
          err.message.includes("ETIMEDOUT")) &&
        i < maxRetries - 1
      ) {
        console.warn(`Retry ${i + 1}/${maxRetries} due to max clients error`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        continue;
      }
      throw err;
    }
  }
  throw new Error("Max retries reached");
}

// Release seats
async function releaseSeats(seatIds: string[]): Promise<void> {
  if (!seatIds || seatIds.length === 0) {
    // logger.warn("No seat IDs provided for releaseSeats");
    return; // Early return for empty input
  }

  // Ensure Redis is available (should be handled at app startup, but we log and throw here)
  if (!redis) {
    const errorMsg = "Redis client not initialized";
    // logger.error(errorMsg);
    throw new Error(errorMsg); // Critical failure, no point in proceeding
  }

  try {
    // Step 1: Update seats in the database within a transaction
    await prisma.$transaction(async (tx) => {
      const updatedCount = await tx.showSeat.updateMany({
        where: { id: { in: seatIds } },
        data: {
          isReserved: false,
          status: "AVAILABLE",
        },
      });

      if (updatedCount.count !== seatIds.length) {
        throw new Error("Mismatch in number of seats updated");
      }
    });

    // Step 2: Remove Redis locks atomically
    const multi = redis.multi();
    seatIds.forEach((seatId) => multi.del(`seat:lock:${seatId}`));
    const execResult = await withRetry(() => multi.exec());

    if (!execResult || execResult.some(([err]) => err)) {
      throw new Error("Failed to remove some or all Redis locks");
    }

    // logger.info(`Successfully released seats: ${seatIds.join(", ")}`);
  } catch (err) {
    // Log the error with details and rethrow for the caller to handle
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.log("oue8uj", errorMessage);
    // logger.error(`Failed to release seats ${seatIds.join(", ")}: ${errorMessage}`, {
    //   error: err,
    //   seatIds,
    // });

    // Attempt rollback if partial failure occurred (e.g., Redis failed but DB succeeded)
    try {
      await prisma.showSeat.updateMany({
        where: { id: { in: seatIds } },
        data: {
          isReserved: true, // Revert to reserved if Redis rollback is needed
          status: "RESERVED",
        },
      });
      // logger.warn(`Rolled back seat status for ${seatIds.join(", ")} due to Redis failure`);
    } catch (rollbackErr) {
      console.log("oue8uj", rollbackErr);
      // logger.error("Rollback failed after releaseSeats error", {
      //   originalError: err,
      //   rollbackError: rollbackErr,
      // });
    }

    throw err; // Rethrow the original error for upstream handling
  }
}

// Use in lockBooking
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
}) {
  const lockTTL = 10 * 60;

  const show = await prisma.show.findUnique({
    where: { id: showId },
  });

  if (!show) {
    return NextResponse.json({ error: "Invalid show ID" }, { status: 404 });
  }
  if (!redis) {
    throw new Error("Redis client not initialized");
  }
  for (const seatId of selectedSeatIds) {
    const lockKey = `seat:lock:${seatId}`;

    const isLocked = await withRetry(() => redis.get(lockKey));
    if (isLocked) {
      return NextResponse.json(
        { error: `Seat ${seatId} is already locked` },
        { status: 409 }
      );
    }
  }

  const multi = redis.multi();
  selectedSeatIds.forEach((seatId: string) => {
    const lockKey = `seat:lock:${seatId}`;
    multi.set(lockKey, userId, "EX", lockTTL, "NX");
  });

  const lockResults = await withRetry(() => multi.exec());

  if (!lockResults) {
    await releaseSeats(selectedSeatIds);
    return NextResponse.json(
      { error: "Failed to acquire locks due to Redis error" },
      { status: 500 }
    );
  }

  if (lockResults.some(([err, result]) => err || result === null)) {
    await releaseSeats(selectedSeatIds);
    return NextResponse.json(
      { error: "Seats are already booked" },
      { status: 409 }
    );
  }

  const bookingKey = `booking:temp:${userId}`;
  const bookingData = {
    userId,
    showId,
    selectedSeatIds,
    total,
    createdAt: Date.now(),
  };
  await withRetry(() =>
    redis.set(bookingKey, JSON.stringify(bookingData), "EX", lockTTL)
  );

  return NextResponse.json(
    { message: "Seats locked successfully", data: bookingKey },
    { status: 200 }
  );
}

//  :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::      confirm booking   ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

async function sendBookingEmail({
  email,
  movieTitle,
  hallName,
  seats,
  total,
  bookingId,
}: {
  email: string;
  movieTitle: string;
  hallName: string;
  seats: { row: string; column: string }[];
  total: number;
  bookingId: string;
}) {
  const seatDetails = seats
    ?.map((seat) => `${seat.row}${seat.column}`)
    .join(", ");

  // const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: false, // true for port 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const data = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Booking Confirmation - ${bookingId}`,
      text: ``,
      html: `
      <h2>Booking Confirmed!</h2>
      <p>Thank you for your booking. Here are your details:</p>
      <ul>
        <li>Movie: ${movieTitle}</li>
        <li>Cinema Hall: ${hallName}</li>
        <li>Seats: ${seatDetails}</li>
        <li>Total Amount: $${total}</li>
        <li>Booking ID: ${bookingId}</li>
      </ul>
      <p>Enjoy your movie!</p>
    `,
    });

    console.log("Email sent successfully:", data);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

// verify seat availability
async function verifySeatsAvailability(seatIds: string[]) {
  const seats = await prisma.$transaction(async (tx) => {
    const lockedSeats = await tx.showSeat.findMany({
      where: {
        id: { in: seatIds },
      },
      select: {
        id: true,
        isReserved: true,
        status: true,
        row: true,
        column: true,
      },
    });

    const check = lockedSeats.every(
      (seat) => !seat.isReserved && seat.status === "AVAILABLE"
    );
    if (!check) {
      throw new Error("Some seats are no longer available.");
    }
    return lockedSeats;
  });

  return {
    seats,
    check: seats.every(
      (seat) => !seat.isReserved && seat.status === "AVAILABLE"
    ),
  };
}
// create booking
async function createBooking({
  selectedSeatIds,
  userId,
  amount,
  showId,
}: {
  userId: string;
  showId: string;
  selectedSeatIds: string[];
  amount: number;
}) {
  return await prisma.$transaction(async (tx) => {
    try {
      // Create the booking
      const booking = await tx.booking.create({
        data: {
          userId,
          showId,
          status: "CONFIRMED",
        },
      });

      // Link seats to booking
      await tx.bookingSeat.createMany({
        data: selectedSeatIds?.map((seatId) => ({
          bookingId: booking.id,
          showSeatId: seatId,
        })),
      });

      // Update seat status
      await tx.showSeat.updateMany({
        where: { id: { in: selectedSeatIds } },
        data: {
          isReserved: true,
          status: "RESERVED",
        },
      });

      // Create payment record
      const payment = await tx.payment.create({
        data: {
          bookingId: booking.id,
          amount,
          mode: "CARD",
          status: "COMPLETED",
        },
      });

      return { booking, payment };
    } catch (error) {
      console.error("Error creating booking:", error);
      throw new Error("Failed to create booking.");
    }
  });
}

export async function confirmBooking({
  amount,
  userId,
  bookingKey,
}: {
  amount: number;
  userId: string;
  bookingKey: string;
}) {
  console.log("fsdjf883", amount, userId, bookingKey);
  // Get booking data from Redis
  if (!redis) {
    throw new Error("Redis client not initialized");
  }
  const bookingDataStr = await redis.get(bookingKey);
  console.log("fsdjf883AAAA", bookingDataStr);

  if (!bookingDataStr) {
    return NextResponse.json(
      { error: "Booking session expired or invalid" },
      { status: 400 }
    );
  }

  const bookingData = JSON.parse(bookingDataStr);
  const { selectedSeatIds, showId } = bookingData;

  // Verify seats are still available
  const seatsAvailable = await verifySeatsAvailability(selectedSeatIds);

  if (!seatsAvailable.check) {
    await releaseSeats(selectedSeatIds);
    await redis.del(bookingKey);
    return NextResponse.json(
      { error: "Selected seats are no longer available" },
      { status: 409 }
    );
  }

  // Create booking in database
  const { booking, payment } = await createBooking({
    userId,
    showId,
    selectedSeatIds,
    amount,
  });

  // Fetch additional details for notification and email
  const showDetails = await prisma.show.findUnique({
    where: { id: showId },
    include: {
      movie: true,
      cinemaHall: true,
    },
  });

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || !showDetails) {
    throw new Error("User or show details not found.");
  }
  // Create notification
  await prisma.notification.create({
    data: {
      userId,
      content: `Your booking for ${showDetails?.movie.title} at ${
        showDetails?.cinemaHall.name
      } has been confirmed. Seats: ${seatsAvailable.seats
        ?.map((s) => `${s.row}${s.column}`)
        .join(", ")}`,
    },
  });

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  const paymentIntentPayload = {
    amount: Math.round(amount * 100),
    currency: "usd",
    description: `Booking ${booking.id} for bookmyshow-clone`,
    metadata: {
      bookingId: booking.id,
      paymentId: payment.id,
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
    automatic_payment_methods: { enabled: true },
  };
  const paymentIntent = await stripe.paymentIntents.create(
    paymentIntentPayload
  );

  console.log("fsdjf883HHHH", paymentIntent);

  // Send confirmation email
  await sendBookingEmail({
    email: user!.email,
    movieTitle: showDetails!.movie.title,
    hallName: showDetails!.cinemaHall.name,
    seats: seatsAvailable.seats,
    total: amount,
    bookingId: booking.id,
  });

  await redis.del(bookingKey);
  await resetRedisClient();

  return NextResponse.json({
    clientSecret: paymentIntent.client_secret,
    bookingId: booking.id,
  });
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//  handle payment completion
// async function handlePaymentCompletion({
//   bookingId,
//   paymentId,
//   success,
// }: {
//   bookingId: string;
//   paymentId: string;
//   success: boolean;
// }) {
//   return await prisma.$transaction(async (tx) => {
//     try {
//       const booking = await tx.booking.findUnique({
//         where: { id: bookingId },
//         include: { seats: { include: { showSeat: true } } },
//       });

//       if (!booking) {
//         throw new Error("Booking not found");
//       }

//       if (success) {
//         // Update booking to CONFIRMED
//         await tx.booking.update({
//           where: { id: bookingId },
//           data: { status: "CONFIRMED" },
//         });

//         // Update payment to COMPLETED
//         await tx.payment.update({
//           where: { id: paymentId },
//           data: { status: "COMPLETED" },
//         });

//         // Get additional details for email
//         // const [showDetails, user] = await Promise.all([
//         //   prisma.show.findUnique({
//         //     where: { id: booking.showId },
//         //     include: { movie: true, cinemaHall: true },
//         //   }),
//         //   prisma.user.findUnique({ where: { id: booking.userId } }),
//         // ]);

//         // Send confirmation email
//         // await sendBookingEmail({
//         //   email: user!.email,
//         //   movieTitle: showDetails!.movie.title,
//         //   hallName: showDetails!.cinemaHall.name,
//         //   seats: booking.seats.map((s) => s.showSeat),
//         //   // Todo:
//         //   // total: booking.payment.amount,
//         //   total: 345,
//         //   bookingId: booking.id,
//         // });

//         // Clean up Redis
//         await redis.del(`booking:timeout:${bookingId}`);
//       } else {
//         // Payment failed, cancel booking
//         await tx.booking.update({
//           where: { id: bookingId },
//           data: { status: "CANCELED" },
//         });

//         await tx.payment.update({
//           where: { id: paymentId },
//           data: { status: "FAILED" },
//         });

//         // Release seats
//         const seatIds = booking.seats.map((s) => s.showSeatId);
//         await releaseSeats(seatIds);
//       }

//       return { success: true };
//     } catch (error) {
//       console.error("Payment completion error:", error);
//       throw error;
//     }
//   });
// }

// Function to handle booking timeout/expiration
// export async function handleBookingTimeout(bookingId: string) {
//   const booking = await prisma.booking.findUnique({
//     where: { id: bookingId },
//     include: { seats: true },
//   });

//   if (booking && booking.status === "PENDING") {
//     await prisma.$transaction(async (tx) => {
//       // Update booking status to EXPIRED
//       await tx.booking.update({
//         where: { id: bookingId },
//         data: { status: "EXPIRED" },
//       });

//       // Update payment status to CANCELED if exists
//       await tx.payment.updateMany({
//         where: { bookingId: bookingId },
//         data: { status: "CANCELED" },
//       });

//       // Release seats
//       const seatIds = booking.seats.map((s) => s.showSeatId);
//       await releaseSeats(seatIds);

//       // Clean up Redis
//       await redis.del(`booking:timeout:${bookingId}`);
//     });
//   }
// }

// const data = await resend.emails.send({
//   from: "Acme <onboarding@resend.dev>",
//   to: [email],
//   subject: `Booking Confirmation - ${bookingId}`,
//   html: `
//     <h2>Booking Confirmed!</h2>
//     <p>Thank you for your booking. Here are your details:</p>
//     <ul>
//       <li>Movie: ${movieTitle}</li>
//       <li>Cinema Hall: ${hallName}</li>
//       <li>Seats: ${seatDetails}</li>
//       <li>Total Amount: $${total}</li>
//       <li>Booking ID: ${bookingId}</li>
//     </ul>
//     <p>Enjoy your movie!</p>
//   `,
// });
