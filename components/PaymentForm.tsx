"use client";

import React, { useEffect, useState } from "react";
import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import axios from "axios";

const PaymentForm = ({
  amount,
  userId,
  bookingKey,
}: {
  amount: number;
  userId: string | undefined;
  bookingKey: string;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function initiateCheckout() {
      try {
        const checkoutResponse = await axios.post("/api/stripe/checkout", {
          amount,
          userId,
          bookingKey,
        });
        // const data = await checkoutResponse.json();

        const data = await checkoutResponse.data;
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        }
      } catch (error) {
        console.error("Checkout error:", error);
      }
    }

    initiateCheckout();
  }, [amount, bookingKey, userId]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    if (!stripe || !elements) {
      return;
    }

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setErrorMessage(submitError.message);
      setLoading(false);
      return;
    }

    const baseUrl =
      typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost:3000";
    const returnUrl = `${baseUrl}/payment-success?amount=${amount}`;
    const { error } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        // return_url: `/payment-success?amount=${amount}`,
        return_url: returnUrl,
      },
    });

    if (error) {
      setErrorMessage(error.message);
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
      className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto mt-5 "
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Payment Details</h2>

      {clientSecret && <PaymentElement />}

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
        disabled={!stripe || loading}
        className="w-full mt-6 p-3 bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {!loading ? `Pay ₹${amount}` : "Processing..."}
      </button>
    </form>
  );
};

export default PaymentForm;
