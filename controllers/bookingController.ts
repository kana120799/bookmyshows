import { prisma } from "@/lib/prisma";
import { redis } from "@/utils/redisClient";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import Stripe from "stripe";

// release seats
async function releaseSeats(seatIds: string[]) {
  const multi = redis.multi();
  seatIds.forEach((seatId) => multi.del(`seat:lock:${seatId}`));
  await multi.exec();
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
}) {
  // Todo :-  add session to verify user.

  const lockTTL = 10 * 60;

  //  if showId is valid
  const show = await prisma.show.findUnique({
    where: {
      id: showId,
    },
  });

  if (!show) {
    return NextResponse.json({ error: "Invalid show ID" }, { status: 404 });
  }

  //  if selected seat is already locked
  for (const seatId of selectedSeatIds) {
    const lockKey = `seat:lock:${seatId}`;
    const isLocked = await redis.get(lockKey);
    if (isLocked) {
      return NextResponse.json(
        { error: `Seat ${seatId} is already locked` },
        { status: 409 }
      );
    }
  }

  // Lock all selected seats
  const multi = redis.multi();
  selectedSeatIds.forEach((seatId: string) => {
    const lockKey = `seat:lock:${seatId}`;
    multi.set(lockKey, userId, "EX", lockTTL, "NX"); // NX ensures key is set only if it doesn’t exist
  });

  const lockResults = await multi.exec();

  // when lockResults is null
  if (!lockResults) {
    await releaseSeats(selectedSeatIds);
    return NextResponse.json(
      { error: "Failed to acquire locks due to Redis error" },
      { status: 500 }
    );
  }

  // Check if any lock  failed
  if (lockResults.some(([err, result]) => err || result === null)) {
    // If any lock failed, rollback all locks
    await releaseSeats(selectedSeatIds);
    return NextResponse.json(
      { error: "Seats are already booked" },
      { status: 409 }
    );
  }

  // Store booking details temporarily in Redis
  const bookingKey = `booking:temp:${userId}`;
  const bookingData = {
    userId,
    showId,
    selectedSeatIds,
    total,
    createdAt: Date.now(),
  };
  await redis.set(bookingKey, JSON.stringify(bookingData), "EX", lockTTL);

  return NextResponse.json(
    { message: "Seats locked successfully", data: bookingKey },
    { status: 200 }
  );
}

//  :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::      confirm booking   ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

// const transporter = nodemailer.createTransport({
//   host: process.env.EMAIL_HOST,
//   port: Number(process.env.EMAIL_PORT),
//   secure: true,
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

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

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const data = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: [email],
      subject: `Booking Confirmation - ${bookingId}`,
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
  const seats = await prisma.showSeat.findMany({
    where: {
      id: { in: seatIds },
    },
  });

  const check = seats.every(
    (seat) => !seat.isReserved && seat.status === "AVAILABLE"
  );
  if (!check) {
    throw new Error("Some seats are no longer available.");
  }
  return {
    seats,
    check,
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
    amount: amount,
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

  // Create Stripe payment intent
  // const paymentIntent = await stripe.paymentIntents.create({
  //   amount: amount,
  //   currency: "usd",
  //   description: `Booking ${booking.id} for bookmyshow-clone`,
  //   metadata: {
  //     bookingId: booking.id,
  //     paymentId: payment.id,
  //   },
  //   shipping: {
  //     name: "Random singh",
  //     address: {
  //       line1: "510 Townsend St",
  //       postal_code: "98140",
  //       city: "San Francisco",
  //       state: "CA",
  //       country: "US",
  //     },
  //   },
  //   automatic_payment_methods: { enabled: true },
  // });
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

  // Clean up Redis
  await releaseSeats(selectedSeatIds);
  await redis.del(bookingKey);

  return NextResponse.json({
    clientSecret: paymentIntent.client_secret,
    bookingId: booking.id,
  });
}
