
import { useState, useEffect } from "react";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import Loader from "../Loader";
import { useRouter } from "next/navigation";

interface Booking {
  id: string;
  show: {
    cinemaHall: {
      name: string;
    };
    startTime: string; // Added startTime
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

export function MyBookingTable({
  bookings: initialBookings,
}: BookingTableProps) {
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;
  const [totalPages, setTotalPages] = useState<number>(1);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Show confirmed first, then canceled
    const confirmedAndCanceled = initialBookings
      .filter(b => b.status === "CONFIRMED" || b.status === "CANCELED")
      .sort((a, b) => new Date(b.show.startTime).getTime() - new Date(a.show.startTime).getTime());

    setFilteredBookings(confirmedAndCanceled);
    setTotalPages(Math.ceil(confirmedAndCanceled.length / itemsPerPage));
  }, [initialBookings]);

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking? This action cannot be undone.")) return;

    setProcessingId(bookingId);
    try {
      const response = await axios.post("/api/booking/cancel", { bookingId });
      if (response.status === 200) {
        toast.success("Booking canceled successfully. Refund initiated.");
        // Optimistically update UI
        setFilteredBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: "CANCELED" } : b));
        router.refresh();
      }
    } catch (error: any) {
      console.error("Cancellation failed:", error);
      toast.error(error.response?.data?.error || "Failed to cancel booking");
    } finally {
      setProcessingId(null);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBookings = filteredBookings.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

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
                Show Time
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
              <th className="py-4 px-6 text-left text-xl font-semibold">
                Status
              </th>
              <th className="py-4 px-6 text-left text-xl font-semibold rounded-tr-lg">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {currentBookings.length > 0 ? (
              currentBookings.map((booking) => (
                <tr
                  key={booking.id}
                  className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200"
                >
                  <td className="py-4 px-6 text-gray-700 font-medium text-lg">
                    {booking.id.slice(0, 8)}...
                  </td>
                  <td className="py-4 px-6 text-gray-700 text-lg">
                    {new Date(booking.show.startTime).toLocaleString()}
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
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                        ${booking.status === "CONFIRMED"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                        }`}
                    >
                      {booking.status === "CONFIRMED" && (
                        <CheckCircle className="w-4 h-4 mr-1" />
                      )}
                      {booking.status === "CANCELED" && (
                        <XCircle className="w-4 h-4 mr-1" />
                      )}
                      {booking.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-lg">
                    {booking.status === "CONFIRMED" && (
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        disabled={processingId === booking.id}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition-colors disabled:bg-gray-400"
                      >
                        {processingId === booking.id ? "Processing..." : "Cancel"}
                      </button>
                    )}
                    {booking.status === "CANCELED" && (
                      <span className="text-gray-500 text-sm">Refunded</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="py-12 text-center text-gray-500 font-medium"
                >
                  No confirmed or canceled bookings found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {filteredBookings.length > 0 && (
        <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-lg text-gray-700">
                Showing{" "}
                <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(indexOfLastItem, filteredBookings.length)}
                </span>{" "}
                of{" "}
                <span className="font-medium">{filteredBookings.length}</span>{" "}
                results
              </p>
            </div>
            <div>
              <nav
                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-lg font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-lg font-medium ${currentPage === page
                          ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600"
                          : "bg-white text-gray-500 hover:bg-gray-50"
                        }`}
                    >
                      {page}
                    </button>
                  )
                )}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-lg font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

