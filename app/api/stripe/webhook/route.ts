// // api/stripe/webhook.ts
// import { prisma } from "@/lib/prisma";
// import { redis } from "@/utils/redisClient";
// import { NextRequest, NextResponse } from "next/server";
// import Stripe from "stripe";
// import nodemailer from "nodemailer";

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

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
//     ?.map((seat) => `${seat.row}${seat.column}`)
//     .join(", ");

//   // const resend = new Resend(process.env.RESEND_API_KEY);

//   try {
//     const transporter = nodemailer.createTransport({
//       host: process.env.EMAIL_HOST,
//       port: Number(process.env.EMAIL_PORT),
//       secure: false, // true for port 465, false for other ports
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//       },
//     });

//     const data = await transporter.sendMail({
//       from: process.env.EMAIL_HOST,
//       to: email,
//       subject: `Booking Confirmation - ${bookingId}`,
//       text: ``,
//       html: `
//         <h2>Booking Confirmed!</h2>
//         <p>Thank you for your booking. Here are your details:</p>
//         <ul>
//           <li>Movie: ${movieTitle}</li>
//           <li>Cinema Hall: ${hallName}</li>
//           <li>Seats: ${seatDetails}</li>
//           <li>Total Amount: $${total}</li>
//           <li>Booking ID: ${bookingId}</li>
//         </ul>
//         <p>Enjoy your movie!</p>
//       `,
//     });

//     console.log("Email sent successfully:", data);
//   } catch (error) {
//     console.error("Error sending email:", error);
//   }
// }

// export async function POST(req: NextRequest) {
//   const sig = req.headers.get("stripe-signature");
//   const body = await req.text();

//   let event;

//   try {
//     event = stripe.webhooks.constructEvent(
//       body,
//       sig!,
//       process.env.STRIPE_WEBHOOK_SECRET!
//     );
//   } catch (err) {
//     console.log("eu", err);
//     return NextResponse.json(
//       { error: "Webhook signature verification failed" },
//       { status: 400 }
//     );
//   }

//   switch (event.type) {
//     case "payment_intent.succeeded":
//       const paymentIntent = event.data.object as Stripe.PaymentIntent;
//       await handlePaymentSuccess(paymentIntent);
//       break;
//     case "payment_intent.payment_failed":
//       const failedIntent = event.data.object as Stripe.PaymentIntent;
//       await handlePaymentFailure(failedIntent);
//       break;
//   }

//   return NextResponse.json({ received: true });
// }

// async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
//   const bookingId = paymentIntent.metadata.bookingId;
//   const paymentId = paymentIntent.metadata.paymentId;

//   await prisma.$transaction(async (tx) => {
//     // Update payment status
//     await tx.payment.update({
//       where: { id: paymentId },
//       data: {
//         status: "COMPLETED",
//         transactionId: paymentIntent.id,
//       },
//     });

//     // Update booking status
//     await tx.booking.update({
//       where: { id: bookingId },
//       data: { status: "CONFIRMED" },
//     });

//     // Get booking details for email
//     const booking = await tx.booking.findUnique({
//       where: { id: bookingId },
//       include: {
//         show: { include: { movie: true, cinemaHall: true } },
//         seats: { include: { showSeat: true } },
//         user: true,
//       },
//     });

//     if (booking) {
//       // Send confirmation email
//       await sendBookingEmail({
//         email: booking.user.email,
//         movieTitle: booking.show.movie.title,
//         hallName: booking.show.cinemaHall.name,
//         seats: booking.seats.map((seat) => ({
//           row: seat.showSeat.row,
//           column: seat.showSeat.column,
//         })),
//         total: paymentIntent.amount / 100,
//         bookingId: booking.id,
//       });
//     }

//     // Clean up redis
//     await redis.del(`booking:timeout:${bookingId}`);
//   });
// }

// async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
//   const bookingId = paymentIntent.metadata.bookingId;
//   const paymentId = paymentIntent.metadata.paymentId;

//   await prisma.$transaction(async (tx) => {
//     // Update payment status
//     await tx.payment.update({
//       where: { id: paymentId },
//       data: { status: "FAILED" },
//     });

//     // Update booking status and release seats
//     const booking = await tx.booking.update({
//       where: { id: bookingId },
//       data: { status: "CANCELED" },
//       include: { seats: { include: { showSeat: true } } },
//     });

//     // Release seats
//     const seatIds = booking.seats.map((seat) => seat.showSeatId);
//     await tx.showSeat.updateMany({
//       where: { id: { in: seatIds } },
//       data: {
//         isReserved: false,
//         status: "AVAILABLE",
//       },
//     });

//     // Clean up redis
//     await redis.del(`booking:timeout:${bookingId}`);
//   });
// }
