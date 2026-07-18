import { createSlice } from "@reduxjs/toolkit";

const initialState = "";
const seachSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    setMovieSearch: (state, action) => {
      return (state = action.payload);
    },
  },
});

export const { setMovieSearch } = seachSlice.actions;
export default seachSlice.reducer;
