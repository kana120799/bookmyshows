import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

const getAppUrl = () => {
  const url = process.env.NEXT_PUBLIC_APP_URL;
  if (!url) return "http://localhost:3000";
  if (url.startsWith("http")) return url;
  return `http://${url}`;
};

export async function POST(request: NextRequest) {
  try {
    const { bookingId, tempBookingId } = await request.json();

    if (!bookingId) {
      return NextResponse.json(
        { error: "Booking ID is required" },
        { status: 400 }
      );
    }

    // Fetch booking details
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        payment: true,
        seats: {
          include: { showSeat: true }
        },
        show: {
          include: { movie: true }
        },
        user: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (!booking.payment) {
      return NextResponse.json({ error: "Payment record not found" }, { status: 404 });
    }

    const appUrl = getAppUrl();

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: booking.show.movie.title,
              description: `Booking for ${booking.seats.length} seats: ${booking.seats.map(s => `${s.showSeat.row}-${s.showSeat.column}`).join(", ")}`,
              metadata: {
                showId: booking.showId,
                movie: booking.show.movie.title
              }
            },
            unit_amount: Math.round(booking.payment.amount * 100), // Amount in cents/paise
          },
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/cancel?bookingId=${bookingId}&tempBookingId=${tempBookingId || ''}`,
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 minutes from now
      metadata: {
        bookingId: booking.id,
        tempBookingId: tempBookingId || "",
        userId: booking.userId
      },
      customer_email: booking.user?.email || undefined, // If user relation exists and is populated, can pass email. Not asking for user here but usually booking has userId. 
      // Need to check if booking has include user. 
      // Safe to omit if not sure, Stripe will ask.
      billing_address_collection: "required",
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Checkout session creation failed:", error);

    return NextResponse.json(
      {
        error: "Failed to create checkout session",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
