import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { InfoIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface ShowSeat {
  id: string;
  price: number;
  row: string;
  column: string;
}

interface SelectedSeatsPanelProps {
  selectedSeats: string[];
  seats: ShowSeat[];
  setShowPayment: (value: boolean) => void;
  setTotalAmount: (value: number) => void;
}

const SelectedSeatsPanel = ({
  selectedSeats,
  seats,
  setShowPayment,
  setTotalAmount,
}: SelectedSeatsPanelProps) => {
  // Calculate convenience fee (15% of ticket price)
  const totalPrice = seats?.reduce((sum, seat) => {
    return sum + (seat?.price || 0);
  }, 0);
  const convenienceFee = selectedSeats.length > 0 ? totalPrice * 0.15 : 0;

  const subTotal = totalPrice + convenienceFee;
  const donationAmount = 0;
  const finalAmount = subTotal + donationAmount;

  // Get selected seats
  const getSelectedSeatsText = () => {
    if (selectedSeats.length === 0) return "";

    const seatLabels = selectedSeats
      ?.map((seatId) => {
        const seat = seats.find((s) => s.id === seatId);
        return seat ? `${seat.row}-${seat.column}` : "";
      })
      .filter(Boolean);

    return `${seatLabels.join(", ")} (${selectedSeats.length} Tickets)`;
  };

  return (
    <Card className="w-full max-w-md mx-auto rounded-lg overflow-hidden shadow-md border border-gray-200 bg-white mt-24">
      <CardContent className="p-0">
        <div className="p-5">
          <h2 className="text-2xl font-semibold text-red-500 mb-4">
            BOOKING SUMMARY
          </h2>

          {selectedSeats.length > 0 ? (
            <>
              <div className="flex justify-between mb-1 text-lg">
                <div>
                  <span className="font-medium text-gray-800  text-lg">
                    {getSelectedSeatsText()}
                  </span>
                  {/* <p className="text-lg text-gray-500">SCREEN 2</p> */}
                </div>
                <span className="font-medium">Rs. {totalPrice.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center my-3">
                <div className="flex items-center">
                  <InfoIcon className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-lg text-gray-600">
                    Convenience fees
                  </span>
                </div>
                <span>Rs. {convenienceFee.toFixed(2)}</span>
              </div>

              <Separator className="my-3" />

              <div className="flex justify-between font-medium mb-3  text-xl">
                <span>Sub total</span>
                <span>Rs. {subTotal.toFixed(2)}</span>
              </div>

              <div className="bg-gray-100 -mx-5 p-5 mt-4  text-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center">
                      <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center mr-2">
                        <span className="text-white text-xs">❤</span>
                      </div>
                      <span className="font-medium">Donate to BookAChange</span>
                    </div>
                    <p className="text-lg text-gray-600 mt-1">
                      (₹1 per ticket has been added)
                    </p>
                    <button className="text-lg text-gray-600 underline mt-1">
                      VIEW T&C
                    </button>
                  </div>
                  <div className="text-right">
                    <span className="block">Rs. {donationAmount}</span>
                    {/* <button className="text-pink-500 text-lg">Add Rs. 2</button> */}
                  </div>
                </div>
              </div>

              {/* <div className="mt-4">
                <p className="text-lg text-gray-600">
                  Your current state is{" "}
                  <span className="text-pink-500">Rajasthan</span>
                </p>
              </div> */}
            </>
          ) : (
            <p className="text-gray-500 text-center py-4">
              Please select seats to view booking summary
            </p>
          )}
        </div>

        <div className="bg-yellow-50 p-4 flex justify-between items-center  text-xl">
          <span className="font-semibold">Amount Payable</span>
          <span className="font-semibold">Rs. {finalAmount.toFixed(2)}</span>
        </div>

        {selectedSeats.length > 0 && (
          <div className="p-4">
            <Button
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-xl"
              onClick={() => {
                setTotalAmount(finalAmount);
                setShowPayment(true);
              }}
            >
              Proceed to Payment
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SelectedSeatsPanel;
