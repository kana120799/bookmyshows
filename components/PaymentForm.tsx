"use client";
import { useEffect, useState } from "react";
import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { useRouter } from "next/navigation";

interface PaymentFormProps {
  amount: number;
  tempBookingId: string;
  paymentId: string;
  bookingId: string;
}

export default function PaymentForm({
  amount,
  tempBookingId,
  paymentId,
  bookingId,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const router = useRouter();

  // Fetch the clientSecret when the component mounts
  useEffect(() => {
    const fetchClientSecret = async () => {
      try {
        const response = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tempBookingId, bookingId }),
        });
        const data = await response.json();
        console.log("dfdskfjksd", data);
        if (!response.ok)
          throw new Error(data.error || "Failed to initialize payment");
        setClientSecret(data.clientSecret);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to initialize payment"
        );
      }
    };

    fetchClientSecret();
  }, [tempBookingId, bookingId]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements || !clientSecret) {
      setError("Payment system not initialized");
      return;
    }

    try {
      setProcessing(true);
      const { error: submitError } = await elements.submit();

      if (submitError) throw new Error(submitError.message);

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success?bookingId=${tempBookingId}&amount=${amount}`,
          payment_method_data: {
            billing_details: {
              address: {
                line1: "510 Townsend St",
                postal_code: "98140",
                city: "San Francisco",
                state: "CA",
                country: "US",
              },
            },
          },
        },
        redirect: "if_required",
      });

      if (error) throw new Error(error.message);
      if (paymentIntent?.status === "succeeded") {
        const response = await fetch("/api/stripe/checkout", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentId,
            paymentIntentId: paymentIntent.id,
          }),
        });

        if (!response.ok) throw new Error("Failed to finalize booking");
        router.push(
          `/payment-success?bookingId=${tempBookingId}&amount=${amount}`
        );
      }
    } catch (err) {
      console.error("Payment Error:", err);
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
      router.push(`/payment-failure?amount=${amount}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!bookingId || !paymentId) {
      setError("No booking to cancel");
      return;
    }

    try {
      setCancelling(true);
      const response = await fetch("/api/stripe/checkout", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, paymentId, tempBookingId }),
      });
      console.log("sdfhdsfsd", response);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to cancel booking");
      }
    } catch (err) {
      console.error("Cancel Error:", err);
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setCancelling(false);
      router.push(`/payment-failure?amount=${amount}`);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Complete Your Payment
        </h2>
        <p className="text-gray-600">This is a test payment system</p>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-yellow-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Test Mode</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                Use test card:{" "}
                <span className="font-mono font-bold">4242 4242 4242 4242</span>
              </p>
              <p className="mt-1">Any future date, CVC, and 5-digit ZIP</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="flex justify-between items-center">
          <span className="font-medium text-gray-700">Total Amount:</span>
          <span className="text-xl font-bold text-blue-600">
            ${amount.toFixed(2)}
          </span>
        </div>
      </div>

      {!clientSecret ? (
        <p>Loading payment form...</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-4 bg-white">
            <PaymentElement
              options={{
                layout: {
                  type: "tabs",
                  defaultCollapsed: false,
                },
                fields: {
                  billingDetails: {
                    address: {
                      country: "never",
                    },
                  },
                },
              }}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={!stripe || processing || cancelling}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg disabled:opacity-70 disabled:cursor-not-allowed transition-colors duration-200 flex justify-center items-center"
            >
              {processing ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </>
              ) : (
                `Pay $${amount.toFixed(2)}`
              )}
            </button>

            <button
              type="button"
              onClick={handleCancel}
              disabled={processing || cancelling || !bookingId}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg disabled:opacity-70 disabled:cursor-not-allowed transition-colors duration-200 flex justify-center items-center"
            >
              {cancelling ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Cancelling...
                </>
              ) : (
                "Cancel Booking"
              )}
            </button>
          </div>

          <div className="flex items-center justify-center mt-4">
            <div className="flex items-center space-x-2 text-gray-500 text-sm">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Payments are secure and encrypted</span>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
