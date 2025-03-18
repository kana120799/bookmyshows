"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";

interface ShowSeat {
  id: string;
  isReserved: boolean;
  status: "AVAILABLE" | "RESERVED";
  price: number;
  showId: string;
  row: string;
  column: string;
  type: "REGULAR" | "PREMIUM" | "VIP";
}

const AdminSeatsView = () => {
  const { id: showId } = useParams<{ id: string }>();
  const [seats, setSeats] = useState<ShowSeat[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSeats = async () => {
    try {
      const response = await axios.get(`/api/admin/seats/${showId}`);
      setSeats(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching seats:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeats();
  }, []);

  const getSeatStyles = (seat: ShowSeat) => {
    const baseStyles =
      "w-12 h-12 rounded-lg font-semibold text-white transition-all duration-200  ";

    if (seat.isReserved || seat.status !== "AVAILABLE")
      return `${baseStyles} bg-gray-500 cursor-not-allowed opacity-70 `;

    const typeStyles = {
      VIP: "bg-gradient-to-br from-red-500 to-red-700 ",
      PREMIUM: "bg-gradient-to-br from-purple-500 to-purple-700 ",
      REGULAR: "bg-gradient-to-br from-blue-500 to-blue-700 ",
    };

    return `${baseStyles} ${typeStyles[seat.type]} `;
  };

  const seatsByRow = seats.reduce((acc, seat) => {
    acc[seat.row] = acc[seat.row] || [];
    acc[seat.row].push(seat);
    return acc;
  }, {} as Record<string, ShowSeat[]>);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen ">
        <div className="w-12 h-12 border-4 border-t-blue-500 border-gray-300 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white py-12 px-4 bg-gray-100">
      <div className="max-w-6xl mx-auto mt-10">
        {/* Screen */}
        <div className="w-full mb-20 relative">
          <div className="h-12 bg-gray-600 rounded-t-xl shadow-lg  " />
          <div className="absolute inset-x-0  text-center text-gray-800 mt-2 font-medium">
            SCREEN
          </div>
        </div>

        {/* Seat Grid */}
        <div className="grid gap-6 justify-center">
          {Object.entries(seatsByRow).map(([row, rowSeats]) => (
            <div
              key={row}
              className="flex items-center gap-4 group transition-all duration-300 "
            >
              <span className="w-10 h-10 flex items-center justify-center bg-gray-800 rounded-full font-bold group-hover:bg-gray-700 transition-colors">
                {row}
              </span>
              <div className="flex gap-3">
                {rowSeats
                  .sort((a, b) => a.column.localeCompare(b.column))
                  .map((seat) => (
                    <button
                      key={seat.id}
                      disabled={seat.isReserved || seat.status !== "AVAILABLE"}
                      className={getSeatStyles(seat)}
                      title={`Row ${seat.row} Seat ${seat.column} - $${seat.price} (${seat.type})`}
                    >
                      {seat.column}
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-12 flex flex-wrap justify-center gap-6 bg-gray-200 p-4 rounded-xl shadow-lg">
          {[
            { color: "bg-red-600", label: "VIP" },
            { color: "bg-purple-600", label: "Premium" },
            { color: "bg-blue-600", label: "Regular" },
            { color: "bg-gray-500", label: "Reserved" },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`w-5 h-5 ${color} rounded-full`} />
              <span className="text-gray-900">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminSeatsView;
