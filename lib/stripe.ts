import { loadStripe } from "@stripe/stripe-js";
import Stripe from "stripe";

// Client-side Stripe instance
export const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

// Server-side Stripe instance
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
  typescript: true,
});

// Stripe configuration constants
const getAppUrl = () => {
  const url = process.env.NEXT_PUBLIC_APP_URL;
  if (!url) return "http://localhost:3000";
  if (url.startsWith("http")) return url;
  return `http://${url}`;
};

const appUrl = getAppUrl();

export const STRIPE_CONFIG = {
  currency: "usd",
  payment_method_types: ["card"],
  mode: "payment" as const,
  success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${appUrl}/cancel`,
};
