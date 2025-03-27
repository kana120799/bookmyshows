// import { dbQueryDuration, dbQueryErrors, userSeatLock } from "@/lib/metrics";
import { prisma } from "@/lib/prisma";
import { initializeRedisClient } from "@/utils/redisClient";

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
        console.warn(
          `Retry ${i + 1}/${maxRetries} due to error: ${err.message}`
        );
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        continue;
      }
      throw err;
    }
  }
  throw new Error("Max retries reached");
}

// Release seats
export async function releaseSeats(seatIds: string[]): Promise<void> {
  if (!seatIds.length) return;
  const redis = await initializeRedisClient();

  let dbUpdated = false;
  try {
    await prisma.$transaction(async (tx) => {
      const updatedCount = await tx.showSeat.updateMany({
        where: { id: { in: seatIds } },
        data: { isReserved: false, status: "AVAILABLE" },
      });
      if (updatedCount.count !== seatIds.length) {
        throw new Error("Mismatch in number of seats updated");
      }
      dbUpdated = true;
    });

    const multi = redis.multi();
    seatIds.forEach((seatId) => multi.del(`seat:lock:${seatId}`));
    const execResult = await withRetry(() => multi.exec());
    if (!execResult || execResult.some(([err]) => err)) {
      throw new Error("Failed to remove Redis locks");
    }
  } catch (err) {
    if (dbUpdated) {
      await prisma.showSeat
        .updateMany({
          where: { id: { in: seatIds } },
          data: { isReserved: true, status: "RESERVED" },
        })
        .catch((rollbackErr: unknown) => {
          console.error("Rollback failed:", rollbackErr);
          // TODO: Send to monitoring system (e.g., Sentry)
        });
    }
    throw err instanceof Error
      ? err
      : new Error("Unknown error in releaseSeats");
  }
}

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
  const lockTTL = 10 * 60; // 10 minutes in seconds
  const redis = await initializeRedisClient();

  const show = await prisma.show.findUnique({
    where: { id: showId },
  });
  if (!show) {
    return NextResponse.json({ error: "Invalid show ID" }, { status: 404 });
  }

  try {
    await prisma.$transaction(async (tx) => {
      // Validate seats belong to the show and total matches
      const seats = await prisma.showSeat.findMany({
        where: {
          id: { in: selectedSeatIds },
          isReserved: false,
          status: "AVAILABLE",
        },
        select: { price: true }, //Todo: not sure about this
      });
      if (seats.length !== selectedSeatIds.length) {
        return NextResponse.json(
          { error: "Invalid seat IDs for show" },
          { status: 400 }
        );
      }
      const calculatedTotal = seats.reduce((sum, seat) => sum + seat.price, 0);
      if (calculatedTotal !== total) {
        return NextResponse.json(
          { error: "Total amount mismatch" },
          { status: 400 }
        );
      }

      // Reserve seats in DB
      await tx.showSeat.updateMany({
        where: { id: { in: selectedSeatIds } },
        data: { isReserved: true, status: "RESERVED" },
      });

      // Lock seats in Redis atomically
      const multi = redis.multi();
      selectedSeatIds.forEach((seatId) => {
        const lockKey = `seat:lock:${seatId}`;
        multi.set(lockKey, userId, "EX", lockTTL, "NX");
      });
      const lockResults = await withRetry(() => multi.exec());

      if (
        !lockResults ||
        lockResults.some(([err, result]) => err || result === null)
      ) {
        throw new Error("Failed to lock seats in Redis");
      }
    });

    // Store temporary booking data
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
  } catch (err) {
    await releaseSeats(selectedSeatIds); // Clean up on failure
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to lock seats" },
      { status: 500 }
    );
  }
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
    .map((seat) => `${seat.row}${seat.column}`)
    .join(", ");

  const requiredEnvVars = [
    "EMAIL_HOST",
    "EMAIL_PORT",
    "EMAIL_USER",
    "EMAIL_PASS",
  ];
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing environment variable: ${envVar}`);
    }
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const emailContent = `
    Booking Confirmed!
    Thank you for your booking. Here are your details:
    - Movie: ${movieTitle}
    - Cinema Hall: ${hallName}
    - Seats: ${seatDetails}
    - Total Amount: $${total}
    - Booking ID: ${bookingId}
    Enjoy your movie!
  `;

  try {
    const data = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Booking Confirmation - ${bookingId}`,
      text: emailContent, // Plain-text version
      html: `
        <h2>Booking Confirmed!</h2>
        <p>${emailContent.replace(/\n/g, "<br>")}</p>
      `,
    });
    console.log("Email sent successfully:", data);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send confirmation email");
  }
}

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
    const booking = await tx.booking.create({
      data: { userId, showId, status: "PENDING" }, // Start as PENDING
    });

    await tx.bookingSeat.createMany({
      data: selectedSeatIds.map((seatId) => ({
        bookingId: booking.id,
        showSeatId: seatId,
      })),
    });

    await tx.showSeat.updateMany({
      where: { id: { in: selectedSeatIds } },
      data: { isReserved: true, status: "RESERVED" },
    });

    const payment = await tx.payment.create({
      data: {
        bookingId: booking.id,
        amount,
        mode: "CARD",
        status: "PENDING", // Wait for Stripe confirmation
      },
    });

    return { booking, payment };
  });
}

interface BookingData {
  userId: string;
  showId: string;
  selectedSeatIds: string[];
  total: number;
  createdAt: number;
}

export async function confirmBooking({
  amount,
  userId,
  bookingKey,
}: {
  amount: number;
  userId: string;
  bookingKey: string;
}): Promise<NextResponse> {
  const redis = await initializeRedisClient();
  if (!redis) throw new Error("Redis client not initialized");

  const bookingDataStr = await redis.get(bookingKey);
  if (!bookingDataStr) {
    return NextResponse.json(
      { error: "Booking session expired or invalid" },
      { status: 400 }
    );
  }

  const bookingData: BookingData = JSON.parse(bookingDataStr);
  const { selectedSeatIds, showId } = bookingData;

  // Verify Redis locks (assumes lockBooking sets these)
  const lockChecks = await Promise.all(
    selectedSeatIds.map((seatId) =>
      redis.get(`seat:lock:${seatId}`).then((lock) => lock === userId)
    )
  );
  if (!lockChecks.every(Boolean)) {
    await releaseSeats(selectedSeatIds);
    return NextResponse.json(
      { error: "Seat locks expired or taken by another user" },
      { status: 409 }
    );
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {});
  let paymentIntent: Stripe.PaymentIntent | undefined; // Initialize as undefined

  try {
    paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: "usd",
      description: `Booking for show ${showId}`,
      metadata: { userId, showId, seatIds: selectedSeatIds.join(",") },
      automatic_payment_methods: { enabled: true },
    });

    const { booking, payment } = await createBooking({
      userId,
      showId,
      selectedSeatIds,
      amount,
    });

    await stripe.paymentIntents.update(paymentIntent.id, {
      metadata: { bookingId: booking.id, paymentId: payment.id },
    });

    const [showDetails, user] = await Promise.all([
      prisma.show.findUnique({
        where: { id: showId },
        include: { movie: true, cinemaHall: true },
      }),
      prisma.user.findUnique({ where: { id: userId } }),
    ]);

    if (!user || !showDetails) {
      throw new Error("User or show details not found");
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      bookingId: booking.id,
      paymentId: payment.id,
    });
  } catch (error) {
    // Only attempt to cancel paymentIntent if it was created
    if (paymentIntent) {
      await stripe.paymentIntents.cancel(paymentIntent.id).catch((err) => {
        console.error("Failed to cancel PaymentIntent:", err);
      });
    }
    await releaseSeats(selectedSeatIds);
    await redis.del(bookingKey);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Checkout failed" },
      { status: 500 }
    );
  }
}

//  :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::      confirm booking   ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

export async function finalizeBooking({
  paymentIntentId,
  bookingId,
}: {
  paymentIntentId: string;
  bookingId: string;
}): Promise<NextResponse> {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {});
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (paymentIntent.status !== "succeeded") {
    return NextResponse.json(
      { error: "Payment not completed" },
      { status: 400 }
    );
  }

  try {
    const existingBooking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });
    if (existingBooking?.status === "CONFIRMED") {
      return NextResponse.json({
        message: "Booking already confirmed",
        bookingId,
      });
    }

    const updatedBooking = await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.update({
        where: { id: bookingId },
        data: { status: "CONFIRMED" },
      });

      await tx.payment.update({
        where: { bookingId },
        data: {
          status: "COMPLETED",
          transactionId: paymentIntent.id,
          paymentIntentId: paymentIntent.id,
        },
      });

      return booking;
    });

    const [showDetails, user, bookingSeats] = await Promise.all([
      prisma.show.findUnique({
        where: { id: updatedBooking.showId },
        include: { movie: true, cinemaHall: true },
      }),
      prisma.user.findUnique({ where: { id: updatedBooking.userId } }),
      prisma.bookingSeat.findMany({
        where: { bookingId },
        include: { showSeat: { select: { row: true, column: true } } },
      }),
    ]);

    const seats = bookingSeats.map((bs) => ({
      row: bs.showSeat.row,
      column: bs.showSeat.column,
    }));

    await Promise.all([
      prisma.notification.create({
        data: {
          userId: updatedBooking.userId,
          content: `Your booking for ${showDetails!.movie.title} at ${
            showDetails!.cinemaHall.name
          } has been confirmed. Seats: ${seats
            .map((s) => `${s.row}${s.column}`)
            .join(", ")}`,
        },
      }),
      sendBookingEmail({
        email: user!.email,
        movieTitle: showDetails!.movie.title,
        hallName: showDetails!.cinemaHall.name,
        seats,
        total: paymentIntent.amount / 100,
        bookingId: updatedBooking.id,
      }).catch((err) => {
        console.error("Email sending failed:", err);
        // TODO: Log to monitoring system and retry if critical
      }),
    ]);

    const redis = await initializeRedisClient();
    const seatIds = bookingSeats.map((bs) => bs.showSeatId);
    const multi = redis.multi();
    seatIds.forEach((seatId) => multi.del(`seat:lock:${seatId}`));
    await multi.exec();

    return NextResponse.json({ message: "Booking confirmed", bookingId });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Finalization failed" },
      { status: 500 }
    );
  }
}
