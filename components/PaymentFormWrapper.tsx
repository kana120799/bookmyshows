"use client";

import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import PaymentForm from "./PaymentForm";
import { RootState } from "@/GlobalState/store";
import { useSelector } from "react-redux";

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

if (!stripePromise) {
  throw new Error("Stripe publishable key is not defined");
}

function convertToSubcurrency(amount: number, factor: number = 100): number {
  if (amount <= 0) throw new Error("Amount must be positive");
  return Math.round(amount * factor);
}

export default function PaymentFormWrapper() {
  const { totalAmount, user, bookingId, paymentId, tempBookingId } =
    useSelector((state: RootState) => state.seatData);

  if (!user) {
    return (
      <main className="max-w-6xl mx-auto p-10 text-white text-center border m-10 rounded-md h-auto mt-24">
        <p className="text-red-500">User ID is required for payment</p>
      </main>
    );
  }
  return (
    <main className="max-w-6xl mx-auto p-10 text-white text-center border m-10 rounded-md h-auto mt-24 ">
      {paymentId && bookingId ? (
        <Elements
          stripe={stripePromise}
          options={{
            mode: "payment",
            amount: convertToSubcurrency(totalAmount),
            currency: "usd",
            appearance: {
              theme: "stripe",
            },
          }}
        >
          <PaymentForm
            amount={totalAmount}
            tempBookingId={tempBookingId}
            paymentId={paymentId}
            bookingId={bookingId}
          />
        </Elements>
      ) : (
        <></>
      )}
    </main>
  );
}
