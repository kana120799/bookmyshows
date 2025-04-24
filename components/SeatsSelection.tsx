"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import Loader from "./Loader";
import { useSession } from "next-auth/react";

interface ShowSeat {
  id: string;
  isReserved: boolean;
  status: "AVAILABLE" | "BOOKED";
  price: number;
  showId: string;
  row: string;
  column: string;
  type: "REGULAR" | "PREMIUM" | "VIP";
}

interface BookingData {
  column: string;
  row: string;
  type: string;
  price: number;
  id: string;
}
const SeatsSelection = ({
  id,
  selectedCity,
  setLockSeat,
  setBookingData,
  setTempBookId,
}: {
  selectedCity: string;
  id: string;
  setLockSeat: (value: boolean) => void;
  setTempBookId: (value: string) => void;
  setBookingData: (
    value: {
      column: string;
      row: string;
      type: string;
      id: string;
      price: number;
    }[]
  ) => void;
}) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();

  const showId = searchParams.get("showId");
  const cinemaShowId = searchParams.get("showId");

  const [seats, setSeats] = useState<ShowSeat[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  const fetchSeats = async () => {
    try {
      const response = await fetch(`/api/admin/seats/${showId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        next: { revalidate: 10 * 60 * 60 },
      });
      const responseData = await response.json();
      setSeats(responseData.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching seats:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSeatClick = (seat: ShowSeat) => {
    if (seat.status !== "AVAILABLE" || seat.isReserved) return;

    setSelectedSeats((prev) => {
      if (prev.includes(seat.id)) {
        return prev.filter((id) => id !== seat.id);
      }
      if (prev.length >= 3) {
        alert("You can only book a maximum of 3 tickets at a time.");
        return prev;
      }
      return [...prev, seat.id];
    });
  };

  const getSeatStyles = (seat: ShowSeat) => {
    const baseStyles =
      "w-12 h-12 rounded-lg font-semibold text-white transition-all duration-200  ";
    const selectedStyles = selectedSeats.includes(seat.id)
      ? "ring-2 ring-white scale-105 border-4 border-green-300"
      : "";

    if (seat.isReserved || seat.status !== "AVAILABLE")
      return `${baseStyles} bg-gray-400 cursor-not-allowed opacity-70 `;

    const typeStyles = {
      VIP: "bg-gradient-to-br from-red-400 to-red-600 ",
      PREMIUM: "bg-gradient-to-br from-purple-400 to-purple-600 ",
      REGULAR: "bg-gradient-to-br from-blue-400 to-blue-600 ",
    };

    return `${baseStyles} ${typeStyles[seat.type]} ${selectedStyles}`;
  };

  const seatsByRow = seats.reduce((acc, seat) => {
    acc[seat.row] = acc[seat.row] || [];
    acc[seat.row].push(seat);
    return acc;
  }, {} as Record<string, ShowSeat[]>);

  async function lockSeats(bookingData: BookingData[]) {
    const total = bookingData.reduce(
      (sum, seat) => sum + (seat?.price || 0),
      0
    );
    const convenienceFee = total * 0.15;
    const subTotal = total + convenienceFee;
    const donationAmount = 0;
    const finalAmount = subTotal + donationAmount;
    if (finalAmount <= 0) return;

    try {
      const lockResponse = await axios.post(
        `/api/booking?selectedSeatIds=${bookingData
          .map((seat) => seat.id)
          .join(",")}&total=${finalAmount}&showId=${cinemaShowId}&userId=${
          session?.user?.id
        }`
      );
      const { tempBookingId } = lockResponse.data;
      console.log("dsfjsfsfsfsfs", lockResponse.data);
      setTempBookId(tempBookingId);
      setLoading(false);
      setLockSeat(true);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 429) {
        alert(error.response.data.error);
      } else {
        alert("Some seats are already reserved or unavailable");
      }
      router.push("/");
    }
  }

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen text-white py-12 px-4 bg-gray-100">
      <div
        className="ml-5 cursor-pointer"
        onClick={() => {
          router.push(
            `/customer/buyticket/${selectedCity.toLowerCase()}/${id}?view=slot`
          );
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="38"
          height="38"
          viewBox="0 0 24 24"
          fill="none"
          stroke="gray"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-move-left"
        >
          <path d="M6 8L2 12L6 16" />
          <path d="M2 12H22" />
        </svg>
      </div>
      <div className="max-w-6xl mx-auto">
        {/* Screen */}
        <div className="w-full mb-20 relative">
          <div className="h-10 bg-gray-600 rounded-t-xl shadow-lg  " />
          <div className="absolute inset-x-0  text-center text-gray-800 mt-1 font-medium">
            SCREEN
          </div>
        </div>

        {/* Seat Grid */}
        <div className="grid gap-6 justify-center">
          {Object.entries(seatsByRow)
            ?.sort(([rowA], [rowB]) => rowA.localeCompare(rowB))
            ?.map(([row, rowSeats]) => (
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
                    ?.map((seat) => (
                      <button
                        key={seat.id}
                        onClick={() => handleSeatClick(seat)}
                        disabled={
                          seat.isReserved || seat.status !== "AVAILABLE"
                        }
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

        <div className="mt-12 flex flex-wrap justify-center gap-6 bg-gray-200 p-4 rounded-xl shadow-lg">
          {[
            { color: "bg-red-600", label: "VIP" },
            { color: "bg-purple-600", label: "Premium" },
            { color: "bg-blue-600", label: "Regular" },
            { color: "bg-gray-500", label: "Reserved" },
          ]?.map(({ color, label }) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`w-5 h-5 ${color} rounded-full`} />
              <span className="text-gray-900">{label}</span>
            </div>
          ))}
        </div>

        {/* Selected Seats Panel */}
        {selectedSeats.length > 0 && (
          <div className="mt-12 bg-gray-200 p-6 rounded-xl shadow-lg transition-all duration-300 text-gray-900">
            <h2 className="text-2xl font-semibold mb-4">Selected Seats</h2>
            <div className="grid gap-3">
              {selectedSeats?.map((seatId) => {
                const seat = seats.find((s) => s.id === seatId);
                if (!seat) return null;
                return (
                  <div
                    key={seatId}
                    className="flex justify-between items-center bg-gray-100 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={
                          getSeatStyles(seat).split(" ")[0] +
                          " w-6 h-6 rounded-md"
                        }
                      />
                      {seat.column} ({seat.type})
                    </span>
                    <span className="font-medium">${seat.price}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700">
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>
                  {selectedSeats.reduce((sum, seatId) => {
                    const seat = seats.find((s) => s.id === seatId);
                    return sum + (seat?.price || 0);
                  }, 0)}
                </span>
              </div>
              <button
                className="mt-4 w-full bg-gradient-to-r from-blue-400 to-purple-400 text-white py-3 rounded-lg hover:from-blue-500 hover:to-purple-500 transition-all duration-200"
                onClick={async () => {
                  const bookingData = seats
                    ?.filter((seat) => selectedSeats.includes(seat.id))
                    ?.map((seat) => ({
                      column: seat.column,
                      row: seat.row,
                      type: seat.type,
                      price: seat.price,
                      id: seat.id,
                    }));
                  setBookingData(bookingData);
                  setLoading(true);
                  await lockSeats(bookingData);
                }}
              >
                Proceed to Booking
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeatsSelection;
