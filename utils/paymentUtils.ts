interface ShowSeat {
  id: string;
  price: number;
  row: string;
  column: string;
}

export const getSelectedSeatsText = (
  selectedSeats: string[],
  seats: ShowSeat[]
) => {
  if (selectedSeats.length === 0) return "";

  const seatLabels = selectedSeats
    .map((seatId) => {
      const seat = seats.find((s) => s.id === seatId);
      return seat ? `${seat.row}-${seat.column}` : "";
    })
    .filter(Boolean);

  return `${seatLabels.join(", ")} (${selectedSeats.length} Tickets)`;
};

export const calculateFees = (
  totalPrice: number,
  selectedSeatsCount: number
) => {
  const convenienceFee = selectedSeatsCount > 0 ? totalPrice * 0.15 : 0;
  const subTotal = totalPrice + convenienceFee;
  const donationAmount = 0; // Adjust if dynamic
  const finalAmount = subTotal + donationAmount;
  return { convenienceFee, subTotal, donationAmount, finalAmount };
};
