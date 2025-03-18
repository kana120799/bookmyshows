import { configureStore } from "@reduxjs/toolkit";
import cityReducer from "./slices/citySlice";
import searchMovieReducer from "./slices/searchMovieSlice";

const store = configureStore({
  reducer: {
    city: cityReducer,
    search: searchMovieReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export default store;
