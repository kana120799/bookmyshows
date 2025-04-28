"use client";
import { MovieType } from "@/types/movieType";
import React, { useEffect, useState } from "react";
import MovieCard from "./MovieCard";
import Loader from "./Loader";
import { useSelector } from "react-redux";
import { RootState } from "@/GlobalState/store";
import { Film } from "lucide-react";

function ShowMovieList() {
  const [list, setList] = useState<MovieType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { selectedCity } = useSelector((state: RootState) => state.city);
  const [activeCategory, setActiveCategory] = useState("nowShowing");

  async function fetchMovies() {
    try {
      setLoading(true);
      if (selectedCity !== "") {
        const response = await fetch(
          `/api/movie/movie-with-show?city=${encodeURIComponent(selectedCity)}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            next: { revalidate: 5 * 60 * 60 },
          }
        );

        // if (!response.ok) {
        //   if (response.status === 429) {
        //     alert(
        //       "Rate limit exceeded. Maximum 5 requests per hour allowed. Please try again later"
        //     );
        //   }
        //   throw new Error(`HTTP error! status: ${response.status}`);
        // }

        // If status is 200 (response.ok is true), parse the JSON
        const data = await response.json();
        setList(data.data); // Assuming the response shape is { data: MovieType[] }
      }
    } catch (error) {
      console.error("Error fetching movies:", error);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    fetchMovies();
  }, [selectedCity]);

  if (loading) {
    return <Loader />;
  }
  console.log("fdsiuf89fdsfds", list);
  return (
    <>
      <div className="bg-gray-50 dark:bg-gray-900 mb-5">
        <div className="w-full pt-2 pl-16 md:pl-24 xl:pl-0 transition-all duration-300">
          <div className="mx-auto px-4 sm:px-6 lg:px-8 ">
            <div className="flex items-center justify-between mb-8 border-b border-gray-200 dark:border-gray-700">
              <div className="flex space-x-6">
                <button
                  onClick={() => setActiveCategory("nowShowing")}
                  className={`flex items-center py-4 px-1 font-medium text-lg border-b-2 ${
                    activeCategory === "nowShowing"
                      ? "border-pink-600 text-pink-600 dark:text-pink-500"
                      : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  }`}
                >
                  <Film className="mr-2 h-5 w-5" />
                  Book Tickets
                </button>
              </div>
            </div>
            {list?.length > 0 ? (
              <div className="max-w-[85%] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 ">
                  {list?.map((data) => (
                    <MovieCard
                      data={data}
                      key={data.id}
                      selectedCity={selectedCity}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="max-w-[85%] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-center ">
                  {true && (
                    <div className="text-center py-12 min-h-[30rem] ">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 4v16M17 4v16M4 8h16M4 12h16M4 16h16"
                        />
                      </svg>
                      <h3 className="mt-2 text-2xl font-medium text-gray-900">
                        No shows
                      </h3>
                      <p className="mt-1 text-xl text-gray-500">
                        Show not Available in this region
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default ShowMovieList;
