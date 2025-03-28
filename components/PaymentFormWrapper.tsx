"use client";

import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import PaymentForm from "./PaymentForm";

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

if (!stripePromise) {
  throw new Error("Stripe publishable key is not defined");
}

interface PaymentFormWrapperProps {
  amount: number;
  userId: string | undefined;
  bookingKey: string;
}

function convertToSubcurrency(amount: number, factor: number = 100): number {
  if (amount <= 0) throw new Error("Amount must be positive");
  return Math.round(amount * factor);
}

export default function PaymentFormWrapper({
  amount,
  userId,
  bookingKey,
}: PaymentFormWrapperProps) {
  if (!userId) {
    return (
      <main className="max-w-6xl mx-auto p-10 text-white text-center border m-10 rounded-md h-auto mt-24">
        <p className="text-red-500">User ID is required for payment</p>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto p-10 text-white text-center border m-10 rounded-md h-auto mt-24 bg-gray-800">
      <Elements
        stripe={stripePromise}
        options={{
          mode: "payment",
          amount: convertToSubcurrency(amount),
          currency: "usd",
          appearance: {
            theme: "stripe",
          },
        }}
      >
        <PaymentForm amount={amount} userId={userId} bookingKey={bookingKey} />
      </Elements>
    </main>
  );
}
