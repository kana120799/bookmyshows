// import { prisma } from "@/lib/prisma";
// import { initializeRedisClient, shutdownRedis } from "@/utils/redisClient";
// import { NextResponse } from "next/server";
// import nodemailer from "nodemailer";
// import Stripe from "stripe";
// import { Redis } from "ioredis";

// // Retry mechanism for Redis operations with proper typing
// async function withRetry<T>(
//   fn: () => Promise<T>,
//   retries = 3,
//   delay = 100
// ): Promise<T> {
//   let lastError: Error | undefined;
//   for (let i = 0; i < retries; i++) {
//     try {
//       return await fn();
//     } catch (err) {
//       lastError = err instanceof Error ? err : new Error(String(err));
//       if (i < retries - 1)
//         await new Promise((resolve) => setTimeout(resolve, delay));
//     }
//   }
//   throw lastError || new Error("Retry failed");
// }

// // Release seats
// export async function releaseSeats(seatIds: string[]): Promise<void> {
//   if (!seatIds.length) return;

//   const redis = await initializeRedisClient();
//   let dbUpdated = false;

//   try {
//     await prisma.$transaction(async (tx) => {
//       const updatedCount = await tx.showSeat.updateMany({
//         where: { id: { in: seatIds } },
//         data: { isReserved: false, status: "AVAILABLE" },
//       });
//       if (updatedCount.count !== seatIds.length) {
//         throw new Error("Mismatch in number of seats updated");
//       }
//       dbUpdated = true;
//     });

//     if (redis) {
//       const multi = redis.multi();
//       seatIds.forEach((seatId) => multi.del(`seat:lock:${seatId}`));
//       const execResult = await withRetry(() => multi.exec());
//       if (!execResult || execResult.some(([err]) => err)) {
//         throw new Error("Failed to remove Redis locks");
//       }
//     } else {
//       console.warn("Redis unavailable, skipping lock release");
//     }
//   } catch (err) {
//     if (dbUpdated) {
//       await prisma.showSeat
//         .updateMany({
//           where: { id: { in: seatIds } },
//           data: { isReserved: true, status: "RESERVED" },
//         })
//         .catch((rollbackErr: unknown) => {
//           console.error("Rollback failed:", rollbackErr);
//         });
//     }
//     throw err instanceof Error
//       ? err
//       : new Error("Unknown error in releaseSeats");
//   }
// }

// async function isRedisHealthy(redis: Redis | null): Promise<boolean> {
//   if (!redis || redis.status !== "ready") return false;
//   try {
//     await redis.ping();
//     return true;
//   } catch {
//     return false;
//   }
// }
// // Lock booking
// export async function lockBooking({
//   selectedSeatIds,
//   total,
//   userId,
//   showId,
// }: {
//   selectedSeatIds: string[];
//   total: number;
//   userId: string;
//   showId: string;
// }): Promise<NextResponse> {
//   const lockTTL = 10 * 60; // 10 minutes in seconds
//   const redis: Redis | null = await initializeRedisClient();

//   // Check Redis health
//   if (!redis || !(await isRedisHealthy(redis))) {
//     return NextResponse.json(
//       { error: "Booking system temporarily unavailable" },
//       { status: 503 }
//     );
//   }
//   const show = await prisma.show.findUnique({
//     where: { id: showId },
//   });
//   if (!show) {
//     return NextResponse.json({ error: "Invalid show ID" }, { status: 404 });
//   }

//   try {
//     await prisma.$transaction(async (tx) => {
//       const seats = await tx.showSeat.findMany({
//         where: {
//           id: { in: selectedSeatIds },
//           isReserved: false,
//           status: "AVAILABLE",
//         },
//         select: { price: true },
//       });
//       if (seats.length !== selectedSeatIds.length) {
//         throw new Error("Invalid seat IDs for show");
//       }
//       const calculatedTotal = seats.reduce((sum, seat) => sum + seat.price, 0);
//       if (calculatedTotal !== total) {
//         throw new Error("Total amount mismatch");
//       }

//       await tx.showSeat.updateMany({
//         where: { id: { in: selectedSeatIds } },
//         data: { isReserved: true, status: "RESERVED" },
//       });

//       const multi = redis.multi();
//       selectedSeatIds.forEach((seatId) => {
//         const lockKey = `seat:lock:${seatId}`;
//         multi.set(lockKey, userId, "EX", lockTTL, "NX");
//       });
//       const lockResults = await withRetry(() => multi.exec());
//       if (
//         !lockResults ||
//         lockResults.some(([err, result]) => err || result === null)
//       ) {
//         throw new Error("Failed to lock seats in Redis");
//       }
//     });

//     const bookingKey = `booking:temp:${userId}`;
//     const bookingData = {
//       userId,
//       showId,
//       selectedSeatIds,
//       total,
//       createdAt: Date.now(),
//     };
//     await withRetry(() =>
//       redis.set(bookingKey, JSON.stringify(bookingData), "EX", lockTTL)
//     );

//     return NextResponse.json(
//       { message: "Seats locked successfully", data: bookingKey },
//       { status: 200 }
//     );
//   } catch (err) {
//     await releaseSeats(selectedSeatIds);
//     return NextResponse.json(
//       { error: err instanceof Error ? err.message : "Failed to lock seats" },
//       { status: 500 }
//     );
//   }
// }

// // Send booking confirmation email
// async function sendBookingEmail({
//   email,
//   movieTitle,
//   hallName,
//   seats,
//   total,
//   bookingId,
// }: {
//   email: string;
//   movieTitle: string;
//   hallName: string;
//   seats: { row: string; column: string }[];
//   total: number;
//   bookingId: string;
// }) {
//   const seatDetails = seats
//     .map((seat) => `${seat.row}${seat.column}`)
//     .join(", ");

//   const requiredEnvVars = [
//     "EMAIL_HOST",
//     "EMAIL_PORT",
//     "EMAIL_USER",
//     "EMAIL_PASS",
//   ];
//   for (const envVar of requiredEnvVars) {
//     if (!process.env[envVar]) {
//       throw new Error(`Missing environment variable: ${envVar}`);
//     }
//   }

//   const transporter = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST,
//     port: Number(process.env.EMAIL_PORT),
//     secure: false,
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS,
//     },
//   });

//   const emailContent = `
//     Booking Confirmed!
//     Thank you for your booking. Here are your details:
//     - Movie: ${movieTitle}
//     - Cinema Hall: ${hallName}
//     - Seats: ${seatDetails}
//     - Total Amount: $${total.toFixed(2)}
//     - Booking ID: ${bookingId}
//     Enjoy your movie!
//   `;

//   try {
//     await transporter.sendMail({
//       from: process.env.EMAIL_USER,
//       to: email,
//       subject: `Booking Confirmation - ${bookingId}`,
//       text: emailContent,
//       html: `<h2>Booking Confirmed!</h2><p>${emailContent.replace(
//         /\n/g,
//         "<br>"
//       )}</p>`,
//     });
//   } catch (error) {
//     console.error("Error sending email:", error);
//     throw new Error("Failed to send confirmation email");
//   }
// }

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// export async function confirmBooking({
//   amount,
//   userId,
//   bookingKey,
// }: {
//   amount: number;
//   userId: string;
//   bookingKey: string;
// }): Promise<NextResponse> {
//   const redis: Redis | null = await initializeRedisClient();

//   if (!redis) {
//     console.error("Redis unavailable, cannot process booking");
//     return NextResponse.json(
//       { error: "Booking system temporarily unavailable" },
//       { status: 503 }
//     );
//   }

//   try {
//     const bookingDataStr = await redis.get(bookingKey);
//     if (!bookingDataStr) {
//       return NextResponse.json(
//         { error: "Booking session expired or invalid" },
//         { status: 400 }
//       );
//     }
//     const { selectedSeatIds, showId, total } = JSON.parse(bookingDataStr);

//     console.log("Booking data fetched:", {
//       selectedSeatIds,
//       showId,
//       total,
//       amount,
//     });

//     // if (total !== amount) {
//     //   return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
//     // }

//     const lockChecks = await Promise.all(
//       selectedSeatIds.map(async (seatId: string) => {
//         const lock = await redis.get(`seat:lock:${seatId}`);
//         return lock === userId;
//       })
//     );
//     if (lockChecks.some((isValid) => !isValid)) {
//       await releaseSeats(selectedSeatIds);
//       return NextResponse.json(
//         { error: "Seat locks expired or taken by another user" },
//         { status: 409 }
//       );
//     }

//     const { booking } = await prisma.$transaction(async (tx) => {
//       const booking = await tx.booking.create({
//         data: { userId, showId, status: "PENDING" },
//       });
//       await tx.bookingSeat.createMany({
//         data: selectedSeatIds.map((seatId: string) => ({
//           bookingId: booking.id,
//           showSeatId: seatId,
//         })),
//       });
//       await tx.showSeat.updateMany({
//         where: { id: { in: selectedSeatIds } },
//         data: { isReserved: true, status: "RESERVED" },
//       });
//       const payment = await tx.payment.create({
//         data: {
//           bookingId: booking.id,
//           amount,
//           mode: "CARD",
//           status: "PENDING",
//         },
//       });
//       return { booking, payment };
//     });

//     // const paymentIntent = await stripe.paymentIntents.create({
//     //   amount: Math.round(amount * 100),
//     //   currency: "usd",
//     //   description: `Booking ${booking.id} for show ${showId}`,
//     //   metadata: { userId, bookingKey, bookingId: booking.id },
//     //   automatic_payment_methods: { enabled: true },
//     // });

//     const paymentIntent = await stripe.paymentIntents.create({
//       amount: Math.round(amount * 100),
//       currency: "usd",
//       description: `Booking ${booking.id} for show ${showId}`,
//       metadata: {
//         userId,
//         bookingKey,
//         bookingId: booking.id,
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
//     if (!paymentIntent.client_secret) {
//       throw new Error("Failed to generate payment intent client secret");
//     }
//     await redis.expire(bookingKey, 15 * 60);

//     return NextResponse.json({
//       clientSecret: paymentIntent.client_secret,
//       bookingId: booking.id,
//     });
//   } catch (error) {
//     console.error("Error in confirmBooking:", error);
//     return NextResponse.json(
//       { error: "Failed to process booking" },
//       { status: 500 }
//     );
//   }
// }

// export async function handlePaymentSuccess({
//   bookingId,
//   paymentIntentId,
// }: {
//   bookingId: string;
//   paymentIntentId: string;
// }): Promise<NextResponse> {
//   const redis: Redis | null = await initializeRedisClient();
//   if (!redis) {
//     console.warn("Redis unavailable, proceeding with DB-only confirmation");
//   }
//   try {
//     const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
//     if (paymentIntent.status !== "succeeded") {
//       return NextResponse.json(
//         { error: "Payment not completed" },
//         { status: 400 }
//       );
//     }

//     const booking = await prisma.booking.findUnique({
//       where: { id: bookingId },
//       include: {
//         seats: { select: { showSeatId: true } },
//         show: { include: { movie: true, cinemaHall: true } },
//         user: { select: { email: true } },
//       },
//     });
//     if (!booking) {
//       return NextResponse.json({ error: "Booking not found" }, { status: 404 });
//     }

//     const selectedSeatIds = booking.seats.map((seat) => seat.showSeatId);

//     await prisma.$transaction(async (tx) => {
//       await tx.booking.update({
//         where: { id: bookingId },
//         data: { status: "CONFIRMED" },
//       });
//       await tx.payment.update({
//         where: { bookingId },
//         data: {
//           status: "COMPLETED",
//           transactionId: paymentIntentId,
//           paymentIntentId,
//         },
//       });
//     });

//     if (redis && (await isRedisHealthy(redis))) {
//       const multi = redis.multi();
//       selectedSeatIds.forEach((seatId) => multi.del(`seat:lock:${seatId}`));
//       multi.del(`booking:temp:${paymentIntent.metadata.userId}`);
//       const execResult = await withRetry(() => multi.exec());
//       if (!execResult || execResult.some(([err]) => err)) {
//         console.warn("Failed to clean up Redis keys, manual cleanup required");
//       }
//     }

//     // Send confirmation email
//     const seats = await prisma.showSeat.findMany({
//       where: { id: { in: selectedSeatIds } },
//       select: { row: true, column: true },
//     });
//     await sendBookingEmail({
//       email: booking.user.email,
//       movieTitle: booking.show.movie.title,
//       hallName: booking.show.cinemaHall.name,
//       seats,
//       total: paymentIntent.amount / 100, // Convert cents to dollars
//       bookingId,
//     });
//     shutdownRedis();
//     return NextResponse.json({ message: "Booking confirmed successfully" });
//   } catch (error) {
//     console.error("Error in handlePaymentSuccess:", error);
//     return NextResponse.json(
//       { error: "Failed to confirm booking" },
//       { status: 500 }
//     );
//   }
// }

// // export async function confirmBooking({
// //   amount,
// //   userId,
// //   bookingKey,
// // }: {
// //   amount: number;
// //   userId: string;
// //   bookingKey: string;
// // }): Promise<NextResponse> {
// //   try {
// //     if (!amount || !userId || !bookingKey) {
// //       return NextResponse.json(
// //         { error: "Missing required parameters" },
// //         { status: 400 }
// //       );
// //     }

// //     const paymentIntent = await stripe.paymentIntents.create({
// //       amount: Math.round(amount * 100),
// //       currency: "usd",
// //       description: `Booking for show`,
// //       metadata: {
// //         userId,
// //         bookingKey,
// //       },
// //       automatic_payment_methods: {
// //         enabled: true,
// //       },
// //       shipping: {
// //         name: "Random singh",
// //         address: {
// //           line1: "510 Townsend St",
// //           postal_code: "98140",
// //           city: "San Francisco",
// //           state: "CA",
// //           country: "US",
// //         },
// //       },
// //     });

// //     return NextResponse.json({
// //       clientSecret: paymentIntent.client_secret,
// //     });
// //   } catch (error) {
// //     console.error("Error creating payment intent:", error);
// //     return NextResponse.json(
// //       { error: "Internal server error" },
// //       { status: 500 }
// //     );
// //   }
// // }

// // export async function finalizeBooking({
// //   paymentIntentId,
// //   bookingId,
// // }: {
// //   paymentIntentId: string;
// //   bookingId: string;
// // }): Promise<NextResponse> {
// //   const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {});
// //   const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

// //   if (paymentIntent.status !== "succeeded") {
// //     return NextResponse.json(
// //       { error: "Payment not completed" },
// //       { status: 400 }
// //     );
// //   }

// //   try {
// //     const existingBooking = await prisma.booking.findUnique({
// //       where: { id: bookingId },
// //     });
// //     if (existingBooking?.status === "CONFIRMED") {
// //       return NextResponse.json({
// //         message: "Booking already confirmed",
// //         bookingId,
// //       });
// //     }

// //     const updatedBooking = await prisma.$transaction(async (tx) => {
// //       const booking = await tx.booking.update({
// //         where: { id: bookingId },
// //         data: { status: "CONFIRMED" },
// //       });

// //       await tx.payment.update({
// //         where: { bookingId },
// //         data: {
// //           status: "COMPLETED",
// //           transactionId: paymentIntent.id,
// //           paymentIntentId: paymentIntent.id,
// //         },
// //       });

// //       return booking;
// //     });

// //     const [showDetails, user, bookingSeats] = await Promise.all([
// //       prisma.show.findUnique({
// //         where: { id: updatedBooking.showId },
// //         include: { movie: true, cinemaHall: true },
// //       }),
// //       prisma.user.findUnique({ where: { id: updatedBooking.userId } }),
// //       prisma.bookingSeat.findMany({
// //         where: { bookingId },
// //         include: { showSeat: { select: { row: true, column: true } } },
// //       }),
// //     ]);

// //     const seats = bookingSeats.map((bs) => ({
// //       row: bs.showSeat.row,
// //       column: bs.showSeat.column,
// //     }));

// //     await Promise.all([
// //       prisma.notification.create({
// //         data: {
// //           userId: updatedBooking.userId,
// //           content: `Your booking for ${showDetails!.movie.title} at ${
// //             showDetails!.cinemaHall.name
// //           } has been confirmed. Seats: ${seats
// //             .map((s) => `${s.row}${s.column}`)
// //             .join(", ")}`,
// //         },
// //       }),
// //       sendBookingEmail({
// //         email: user!.email,
// //         movieTitle: showDetails!.movie.title,
// //         hallName: showDetails!.cinemaHall.name,
// //         seats,
// //         total: paymentIntent.amount / 100,
// //         bookingId: updatedBooking.id,
// //       }).catch((err) => {
// //         console.error("Email sending failed:", err);
// //         // TODO: Log to monitoring system and retry if critical
// //       }),
// //     ]);

// //     const redis = await initializeRedisClient();
// //     const seatIds = bookingSeats.map((bs) => bs.showSeatId);
// //     const multi = redis.multi();
// //     seatIds.forEach((seatId) => multi.del(`seat:lock:${seatId}`));
// //     await multi.exec();

// //     return NextResponse.json({ message: "Booking confirmed", bookingId });
// //   } catch (error) {
// //     return NextResponse.json(
// //       { error: error instanceof Error ? error.message : "Finalization failed" },
// //       { status: 500 }
// //     );
// //   }
// // }
