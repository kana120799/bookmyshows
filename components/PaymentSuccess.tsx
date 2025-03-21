"use client";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import React from "react";

function PaymentSuccess() {
  const searchParams = useSearchParams();
  const amount = searchParams.get("amount");
  const router = useRouter();

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
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-green-600"
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

          {/* Heading */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">
              Payment Successful!
            </h1>
            <p className="text-gray-600">Thank you for your booking</p>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg border border-purple-100">
            <p className="text-sm text-gray-600">Amount Paid</p>
            <div className="text-3xl font-semibold text-purple-700">
              ₹{amount}
            </div>
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

export default PaymentSuccess;
