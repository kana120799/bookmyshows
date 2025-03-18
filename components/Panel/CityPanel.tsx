"use client";
import { indianCities } from "@/const/cities";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { setCityToggle, setSelectedCity } from "@/GlobalState/slices/citySlice";
import { redirect } from "next/navigation";

const CityPanel = () => {
  const dispatch = useDispatch();

  const [limitCitiesState, setLimitCitiesState] = useState(false);
  const [searchCities, setSearchCities] = useState("");

  function actionCityChange(city: { city: string }) {
    dispatch(setSelectedCity(city.city.toLowerCase()));
    dispatch(setCityToggle());
    redirect(`/customer/home/${city.city.toLowerCase()}`);
  }

  const limittedCities = () => {
    return indianCities
      .filter(
        (city, index) =>
          !limitCitiesState &&
          index < 9 &&
          city.city.toLowerCase().includes(searchCities.toLowerCase())
      )
      .map((city) => (
        <button
          key={city.city}
          className="flex flex-col items-center gap-2 p-2 rounded-md transition-colors"
          onClick={() => {
            actionCityChange(city);
          }}
        >
          <span className=" text-gray-100 text-2xl ">{city.city}</span>
        </button>
      ));
  };

  const completeCities = () => {
    return indianCities
      .filter(
        (city) =>
          limitCitiesState &&
          city.city.toLowerCase().includes(searchCities.toLowerCase())
      )
      .map((city) => (
        <button
          key={city.city}
          className="flex flex-col items-center gap-2 p-2  rounded-md transition-colors"
          onClick={() => actionCityChange(city)}
        >
          <span className="text-2xl text-gray-100">{city.city}</span>
        </button>
      ));
  };
  return (
    <div className="fixed top-0 left-0 w-full h-full bg-gray-800 bg-opacity-90 z-10">
      <button
        className="absolute top-[7rem] right-[2rem]  hover:text-gray-600"
        onClick={() => dispatch(setCityToggle())} // Close button
      >
        <svg
          className="w-16 h-16"
          fill="none"
          stroke="gray"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
      <div className="flex flex-col gap-4 pt-28">
        <div className="flex justify-center items-center gap-4">
          <div className="relative w-1/2 ">
            <input
              type="text"
              name="city"
              placeholder="Search for your city"
              className="w-full h-[4rem] p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 text-2xl"
              onChange={(e) => setSearchCities(e.target.value)}
            />
            <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400">
              <svg
                className="w-10 h-10"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-4 text-gray-400 pt-14">
          <div className="flex flex-wrap gap-4 justify-center text-gray-400">
            {limitCitiesState ? completeCities() : limittedCities()}
          </div>
          <button
            className="mt-4 px-4 py-2 bg-red-500 text-gray-100 text-2xl rounded-md hover:bg-red-600 mx-auto"
            onClick={() => setLimitCitiesState(!limitCitiesState)}
          >
            {limitCitiesState ? "Show Less" : "View All Cities"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CityPanel;
