import { configureStore } from "@reduxjs/toolkit";
import cityReducer from "./slices/citySlice";
import searchMovieReducer from "./slices/searchMovieSlice";
import selectedSeatReducer from "./slices/selectedSeatSlice";

const store = configureStore({
  reducer: {
    city: cityReducer,
    search: searchMovieReducer,
    seatData: selectedSeatReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export default store;
