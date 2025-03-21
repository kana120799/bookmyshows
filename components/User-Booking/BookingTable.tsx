"use client";

import { CheckCircle, Clock, XCircle } from "lucide-react";

interface Booking {
  id: string;
  show: {
    cinemaHall: {
      name: string;
    };
  };
  seats: {
    showSeat: {
      column: string;
    };
  }[];
  payment?: {
    amount: number;
  };
  status: "PENDING" | "CONFIRMED" | "CANCELED";
}

interface BookingTableProps {
  bookings: Booking[];
}

export function BookingTable({ bookings }: BookingTableProps) {
  return (
    <div className="w-full mt-5 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-lg">
      <h2 className="text-3xl font-extrabold mb-8 text-gray-800 tracking-tight">
        My Bookings
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200 text-gray-600">
              <th className="py-4 px-6 text-left text-xl font-semibold rounded-tl-lg">
                Booking ID
              </th>
              <th className="py-4 px-6 text-left text-xl font-semibold">
                Cinema Hall
              </th>
              <th className="py-4 px-6 text-left text-xl font-semibold">
                Seats
              </th>
              <th className="py-4 px-6 text-left text-xl font-semibold">
                Total Amount
              </th>
              <th className="py-4 px-6 text-left text-xl font-semibold rounded-tr-lg">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {bookings.length > 0 ? (
              bookings.map((booking) => (
                <tr
                  key={booking.id}
                  className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200"
                >
                  <td className="py-4 px-6 text-gray-700 font-medium text-lg">
                    {booking.id.slice(0, 8)}...
                  </td>
                  <td className="py-4 px-6 text-gray-700 text-lg">
                    {booking.show.cinemaHall.name}
                  </td>
                  <td className="py-4 px-6 text-gray-700 text-lg">
                    {booking.seats
                      .map((seat) => seat.showSeat.column)
                      .join(", ")}
                  </td>
                  <td className="py-4 px-6 text-gray-700 font-medium text-lg">
                    ₹{booking.payment?.amount?.toFixed(2) || "N/A"}
                  </td>
                  <td className="py-4 px-6 text-lg">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xl font-medium
                        ${
                          booking.status === "CONFIRMED"
                            ? "bg-green-100 text-green-800"
                            : booking.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                    >
                      {booking.status === "CONFIRMED" && (
                        <CheckCircle className="w-4 h-4 mr-1" />
                      )}
                      {booking.status === "PENDING" && (
                        <Clock className="w-4 h-4 mr-1" />
                      )}
                      {booking.status === "CANCELED" && (
                        <XCircle className="w-4 h-4 mr-1" />
                      )}
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="py-12 text-center text-gray-500 font-medium"
                >
                  No bookings found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
