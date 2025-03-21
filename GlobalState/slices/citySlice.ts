import { createSlice } from "@reduxjs/toolkit";

// export const fetchWeather = createAsyncThunk(
//   'cities/fetchWeather',
//   async (city, { rejectWithValue }) => {
//     try {
//       const response = await fetch(`https://api.example.com/weather?city=${city}`);
//       const data = await response.json();
//       return data;
//     } catch (error) {
//       return rejectWithValue(error.message);
//     }
//   }
// );

interface CityState {
  selectedCity: string;
  showPannel: boolean;
}

const initialState: CityState = {
  selectedCity: "mumbai",
  showPannel: false,
};
const citySlice = createSlice({
  name: "cities",
  initialState,
  reducers: {
    setSelectedCity: (state, action) => {
      state.selectedCity = action.payload;
    },
    setCityToggle: (state) => {
      state.showPannel = !state.showPannel;
    },
  },
  // extraReducers: (builder) => {
  //   builder
  //     .addCase(fetchWeather.pending, (state) => {
  //       state.loading = true;
  //       state.error = null;
  //     })
  //     .addCase(fetchWeather.fulfilled, (state, action) => {
  //       state.loading = false;
  //       state.weatherData = action.payload;
  //     })
  //     .addCase(fetchWeather.rejected, (state, action) => {
  //       state.loading = false;
  //       state.error = action.error.message;
  //     });
  // },
});

export const { setSelectedCity, setCityToggle } = citySlice.actions;
export default citySlice.reducer;
