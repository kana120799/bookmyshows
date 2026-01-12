import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";

import cityReducer from "./slices/citySlice";
import searchMovieReducer from "./slices/searchMovieSlice";
import selectedSeatReducer from "./slices/selectedSeatSlice";


// const store = configureStore({
//   reducer: {
//     city: cityReducer,
//     search: searchMovieReducer,
//     seatData: selectedSeatReducer,
//   },
//   middleware: (getDefaultMiddleware) =>
//     getDefaultMiddleware({
//       serializableCheck: false,
//     }),
// });




const rootReducer = combineReducers({
  city: cityReducer,
  search: searchMovieReducer,
  seatData: selectedSeatReducer,
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["city"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
