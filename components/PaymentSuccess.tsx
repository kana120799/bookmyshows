"use client";

import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

function BookingConfirmed() {
  const [hasMounted, setHasMounted] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) return null;

  const amount = searchParams.get("amount");
  const bookingId = searchParams.get("bookingId");

  const date = new Date()
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
    .replace(/\//g, "-");

  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:3000";
  const returnUrl = `${baseUrl}/`;

  const handleRedirect = () => {
    router.push(returnUrl);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <main className="max-w-md w-full mx-auto p-6 text-center bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">
              Booking Confirmed!
            </h1>
            <p className="text-gray-600">Your booking is now confirmed</p>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
            <p className="text-sm text-gray-600">Booking Reference</p>
            <div className="text-xl font-semibold text-blue-700">
              #{bookingId}
            </div>
          </div>

          <div className="space-y-3 text-left">
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="font-medium">{date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Amount Paid:</span>
              <span className="font-medium">₹{amount}</span>
            </div>
          </div>

          <div className="text-sm text-gray-500">
            <p>You&apos;ll receive a confirmation email shortly.</p>
          </div>

          <button
            onClick={handleRedirect}
            className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-[#F84464] to-[#FF6B88] text-white font-medium rounded-lg hover:from-[#F84464]/90 hover:to-[#FF6B88]/90 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#F84464] focus:ring-opacity-50"
          >
            Return to Home
          </button>
        </div>
      </main>
    </div>
  );
}

export default BookingConfirmed;
