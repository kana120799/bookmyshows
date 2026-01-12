import { NextRequest, NextResponse } from "next/server";
import { stripe, STRIPE_CONFIG } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const { productId, quantity = 1 } = await request.json();
    console.log("fsdfsdfsdf", productId, quantity)
    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const product = {
      id: 'prod_1',
      name: 'Premium Course',
      description: 'Complete Next.js and Stripe integration course',
      price: 4999, // $49.99 in cents
      currency: 'usd',
      image: '/images/course-premium.jpg'
    }
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: STRIPE_CONFIG.payment_method_types,
      mode: STRIPE_CONFIG.mode,
      line_items: [
        {
          price_data: {
            currency: product.currency,
            product_data: {
              name: product.name,
              description: product.description,
            },
            unit_amount: product.price,
          },
          quantity: quantity,
        },
      ],
      success_url: STRIPE_CONFIG.success_url,
      cancel_url: STRIPE_CONFIG.cancel_url,
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 minutes from now
      metadata: {
        productId: product.id,
        quantity: quantity.toString(),
      },
      // Enable customer email collection
      customer_creation: "always",
      // Add billing address collection
      billing_address_collection: "required",
      // Add shipping for physical products (optional)
      // shipping_address_collection: {
      //   allowed_countries: ['US', 'CA'],
      // },
    });
    console.log("session ==>>", session);
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
