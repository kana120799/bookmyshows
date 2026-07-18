import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json(
      { error: "Session ID is required" },
      { status: 400 }
    );
  }

  try {
    // 1. Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // 2. Check if paid
    if (session.payment_status === "paid") {
      const bookingId = session.metadata?.bookingId;

      if (bookingId) {
        // 3. Update DB
        await prisma.$transaction(async (tx) => {
          // Update Payment
          const payment = await tx.payment.findFirst({
            where: { bookingId: bookingId }
          });

          if (payment) {
            await tx.payment.update({
              where: { id: payment.id },
              data: {
                status: "COMPLETED",
                transactionId: session.payment_intent as string || sessionId,
                paymentIntentId: session.payment_intent as string
              }
            });
          }

          // Update Booking
          await tx.booking.update({
            where: { id: bookingId },
            data: { status: "CONFIRMED" }
          });

          // Update Seats (Usually already RESERVED by lockpayment, but good to confirm or ensure they stay that way.
          // Lock payment usually sets them to RESERVED. 
          // If your system requires changing to "BOOKED", do it here. 
          // Based on previous code, confirmed booking implies success.
        });
      }
    }

    return NextResponse.json({ session });
  } catch (error: any) {
    console.error("Error retrieving checkout session:", error);
    return NextResponse.json(
      { error: "Failed to retrieve session" },
      { status: 500 }
    );
  }
}
