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
    <main className="max-w-6xl mx-auto p-10 text-center border m-10 rounded-md bg-white shadow-md">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold mb-2 text-gray-800">
          Thank you!
        </h1>
        <h2 className="text-2xl text-gray-600">
          Your Ticket Mailed On Your email.
        </h2>
        <div className="bg-gray-100 p-6 rounded-md text-purple-600 mt-5 text-4xl font-bold shadow-sm">
          Paid: ₹{amount}
        </div>
        <button
          onClick={handleRedirect}
          className="mt-10 px-6 py-3  text-white font-semibold rounded-lg bg-[#F84464] hover:bg-[#F84464]/90 text-xl transition-all duration-300"
        >
          Return to Home
        </button>
      </div>
    </main>
  );
}

export default PaymentSuccess;
