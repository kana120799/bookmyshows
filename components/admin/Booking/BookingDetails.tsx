"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import Loader from "@/components/Loader";

interface BookingDetailsItem {
  id: string;
  userId: string;
  showId: string;
  status: string;
  user: { name: string; email: string; phone: string | null };
  show: {
    movie: { title: string };
    cinemaHall: { name: string };
    startTime: string;
  };
  seats: {
    showSeat: { row: string; column: string; price: number; type: string };
  }[];
  payment: { amount: number; mode: string; createdOn: string; status: string };
}

export default function BookingDetails() {
  const router = useRouter();
  const { id } = useParams();
  const [booking, setBooking] = useState<BookingDetailsItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await axios.get(`/api/admin/booking/${id}`);
        setBooking(response.data.data);
      } catch (error) {
        console.error("Error fetching booking details:", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchBooking();
  }, [id]);

  if (loading) return <Loader />;
  if (!booking)
    return <div className="text-center py-12">Booking not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 text-xl">
      <header className="bg-white shadow-md p-6 sticky top-0 z-10">
        <div className=" mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Booking Details</h1>
          <button
            className="text-gray-600 hover:text-gray-800 flex items-center gap-2"
            onClick={() => router.push("/admin/booking")}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Bookings
          </button>
        </div>
      </header>

      <main className=" mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          {/* Booking Info */}
          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Booking Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-lg text-gray-600">Booking ID</p>
                <p className="text-lg font-medium text-gray-900">
                  {booking.id}
                </p>
              </div>
              <div>
                <p className="text-lg text-gray-600">Status</p>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    booking.status === "CONFIRMED"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {booking.status}
                </span>
              </div>
            </div>
          </section>

          {/* User Info */}
          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              User Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-lg text-gray-600">Name</p>
                <p className="text-lg font-medium text-gray-900">
                  {booking.user.name}
                </p>
              </div>
              <div>
                <p className="text-lg text-gray-600">Email</p>
                <p className="text-lg font-medium text-gray-900">
                  {booking.user.email}
                </p>
              </div>
              <div>
                <p className="text-lg text-gray-600">Phone</p>
                <p className="text-lg font-medium text-gray-900">
                  {booking.user.phone || "—"}
                </p>
              </div>
              <div>
                <p className="text-lg text-gray-600">User ID</p>
                <p className="text-lg font-medium text-gray-900">
                  {booking.userId}
                </p>
              </div>
            </div>
          </section>

          {/* Show Info */}
          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Show Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-lg text-gray-600">Movie</p>
                <p className="text-lg font-medium text-gray-900">
                  {booking.show.movie.title}
                </p>
              </div>
              <div>
                <p className="text-lg text-gray-600">Cinema Hall</p>
                <p className="text-lg font-medium text-gray-900">
                  {booking.show.cinemaHall.name}
                </p>
              </div>
              <div>
                <p className="text-lg text-gray-600">Show Time</p>
                <p className="text-lg font-medium text-gray-900">
                  {new Date(booking.show.startTime).toLocaleString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <div>
                <p className="text-lg text-gray-600">Show ID</p>
                <p className="text-lg font-medium text-gray-900">
                  {booking.showId}
                </p>
              </div>
            </div>
          </section>

          {/* Seats Info */}
          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Seat Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {booking.seats.map((seat, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-lg text-gray-600">Seat</p>
                  <p className="text-lg font-medium text-gray-900">
                    {seat.showSeat.row}
                    {seat.showSeat.column} ({seat.showSeat.type})
                  </p>
                  <p className="text-lg text-gray-600 mt-1">Price</p>
                  <p className="text-lg font-medium text-gray-900">
                    ₹{seat.showSeat.price}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Payment Info */}
          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Payment Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-lg text-gray-600">Amount</p>
                <p className="text-lg font-medium text-gray-900">
                  ₹{booking.payment.amount}
                </p>
              </div>
              <div>
                <p className="text-lg text-gray-600">Mode</p>
                <p className="text-lg font-medium text-gray-900">
                  {booking.payment.mode}
                </p>
              </div>
              <div>
                <p className="text-lg text-gray-600">Status</p>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    booking.payment.status === "COMPLETED"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {booking.payment.status}
                </span>
              </div>
              <div>
                <p className="text-lg text-gray-600">Created On</p>
                <p className="text-lg font-medium text-gray-900">
                  {new Date(booking.payment.createdOn).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
