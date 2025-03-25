import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import PaymentForm from "./PaymentForm";

if (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY === undefined) {
  throw new Error("NEXT_PUBLIC_STRIPE_PUBLIC_KEY is not defined");
}
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

export default function PaymentFormWrapper({
  amount,
  userId,
  bookingKey,
}: {
  amount: number;
  userId: string | undefined;
  bookingKey: string;
}) {
  function convertToSubcurrency(amount: number, factor = 100) {
    return Math.round(amount * factor);
  }
  return (
    <main className="max-w-6xl mx-auto p-10 text-white text-center border m-10 rounded-md h-auto mt-24">
      <Elements
        stripe={stripePromise}
        options={{
          mode: "payment",
          amount: convertToSubcurrency(amount),
          // amount: amount,
          currency: "usd",
        }}
      >
        <PaymentForm amount={amount} userId={userId} bookingKey={bookingKey} />
      </Elements>
    </main>
  );
}
