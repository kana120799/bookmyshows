"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import axios from "axios";

interface PaymentFormProps {
  amount: number;
  userId: string | undefined;
  bookingKey: string;
}

export default function PaymentForm({
  amount,
  userId,
  bookingKey,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [clientSecret, setClientSecret] = useState<string>("");
  const [bookingId, setBookingId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [checkoutInitiated, setCheckoutInitiated] = useState<boolean>(false);

  useEffect(() => {
    async function initiateCheckout() {
      if (checkoutInitiated) return; // Prevent multiple calls
      setCheckoutInitiated(true);
      try {
        const response = await axios.post<{
          clientSecret: string;
          bookingId: string;
        }>("/api/stripe/checkout", { amount, userId, bookingKey });
        const { clientSecret, bookingId } = response.data;
        if (!clientSecret) {
          throw new Error("No client secret returned from server");
        }
        setClientSecret(clientSecret);
        setBookingId(bookingId); // Assuming backend returns bookingId
      } catch (error) {
        console.error("Checkout error:", error);
        setErrorMessage("Failed to initialize payment. Please try again.");
      }
    }
    if (userId) initiateCheckout(); // Only run if userId is defined
  }, [userId, bookingKey, amount, checkoutInitiated]);

  useEffect(() => {
    return () => {
      if (loading && bookingKey && !clientSecret) {
        // Only release if payment hasn’t started
        axios.post("/api/release-seats", { bookingKey }).catch((err) => {
          console.error("Failed to release seats on unmount:", err);
        });
      }
    };
  }, [loading, bookingKey, clientSecret]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    if (!stripe || !elements || !clientSecret || !bookingId) {
      setErrorMessage("Payment system not ready.");
      setLoading(false);
      return;
    }

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setErrorMessage(submitError.message);
      setLoading(false);
      return;
    }

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success?amount=${amount}`,
      },
      redirect: "if_required",
    });

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      try {
        const finalizeResponse = await axios.post<{ message: string }>(
          "/api/stripe/finalize",
          { paymentIntentId: paymentIntent.id, bookingId }
        );

        if (finalizeResponse.data.message === "Booking confirmed") {
          router.push(
            `/payment-success?amount=${amount}&bookingId=${bookingId}`
          );
        } else {
          throw new Error("Booking finalization failed");
        }
      } catch (finalizeError) {
        console.error("Finalize error:", finalizeError);
        setErrorMessage(
          "Payment succeeded, but booking confirmation failed. Please contact support."
        );
      }
    }

    setLoading(false);
  };

  if (!clientSecret || !stripe || !elements) {
    return (
      <div className="flex items-center justify-center min-h-[23rem]">
        <div
          className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-500 border-e-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
          role="status"
        >
          <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
            Loading...
          </span>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto mt-5"
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Payment Details</h2>
      <PaymentElement />
      <div className="mt-4 p-4 bg-gray-50 rounded-md text-sm text-gray-600">
        <p className="font-semibold">Testing the payment flow?</p>
        <p>
          Use the test card number:{" "}
          <span className="font-mono bg-gray-200 px-2 py-1 rounded text-lg font-bold">
            4242 4242 4242 4242
          </span>
        </p>
        <p>Any future date and CVC will work.</p>
      </div>
      {errorMessage && (
        <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
          {errorMessage}
        </div>
      )}
      <button
        disabled={!stripe || !elements || loading}
        className="w-full mt-6 p-3 bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Processing..." : `Pay $${amount}`}
      </button>
    </form>
  );
}
