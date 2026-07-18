
"use client";

import React from "react";

const PaymentFormWrapper = () => {
    return (
        <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Payment Gateway</h2>
            <p className="text-gray-600 mb-6 text-center">
                Secure payment processing is being initialized.
            </p>
            {/* Placeholder for actual Stripe Elements integration */}
            <div className="w-full h-12 bg-gray-100 animate-pulse rounded"></div>
        </div>
    );
};

export default PaymentFormWrapper;
