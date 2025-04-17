import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SelectedSeatState {
  totalAmount: number;
  tempBookingId: string;
  bookingId: string;
  paymentId: string;
  user: {
    id: string;
    name: string;
    role: string;
    email: string;
  };
}

interface User {
  id: string;
  name: string;
  role: string;
  email: string;
}
const initialState: SelectedSeatState = {
  totalAmount: 0,
  tempBookingId: "",
  user: {
    id: "",
    name: "",
    role: "",
    email: "",
  },
  bookingId: "",
  paymentId: "",
};

const selectedSeatSlice = createSlice({
  name: "selectedSeat",
  initialState,
  reducers: {
    setSelectedSeatsData: (
      state,
      action: PayloadAction<{
        totalAmount: number;
        tempBookingId: string;
        bookingId: string;
        paymentId: string;
        user: User;
      }>
    ) => {
      state.totalAmount = action.payload.totalAmount;
      state.tempBookingId = action.payload.tempBookingId;
      state.user = action.payload.user;
      state.bookingId = action.payload.bookingId;
      state.paymentId = action.payload.paymentId;
    },
    resetSelectedSeatData: () => initialState,
  },
});

export const { setSelectedSeatsData, resetSelectedSeatData } =
  selectedSeatSlice.actions;

export default selectedSeatSlice.reducer;
