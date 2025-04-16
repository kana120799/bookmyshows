import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});
export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature")!;
  const body = await req.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.log(err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await handleSuccessfulPayment(paymentIntent);
      break;
    case "payment_intent.payment_failed":
      const failedIntent = event.data.object as Stripe.PaymentIntent;
      await handleFailedPayment(failedIntent);
      break;
  }

  return NextResponse.json({ received: true });
}

async function handleSuccessfulPayment(paymentIntent: Stripe.PaymentIntent) {
  await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.update({
      where: { paymentIntentId: paymentIntent.id },
      data: { status: "COMPLETED" },
      include: { booking: true },
    });

    await tx.booking.update({
      where: { id: payment.bookingId },
      data: { status: "CONFIRMED" },
    });
  });
}

async function handleFailedPayment(paymentIntent: Stripe.PaymentIntent) {
  await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.update({
      where: { paymentIntentId: paymentIntent.id },
      data: { status: "FAILED" },
      include: { booking: { include: { seats: true } } },
    });

    await tx.showSeat.updateMany({
      where: { id: { in: payment.booking.seats.map((s) => s.showSeatId) } },
      data: { status: "AVAILABLE", isReserved: false },
    });
  });
}
