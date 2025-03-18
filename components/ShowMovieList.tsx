"use client";
import { MovieType } from "@/types/movieType";
import React, { useEffect, useState, useCallback } from "react";
import MovieCard from "./MovieCard";
import Loader from "./Loader";
import { useSelector } from "react-redux";
import { RootState } from "@/GlobalState/store";
import { Film } from "lucide-react";
import axios from "axios";

function ShowMovieList() {
  const [list, setList] = useState<MovieType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { selectedCity } = useSelector((state: RootState) => state.city);
  const [activeCategory, setActiveCategory] = useState("nowShowing");

  const fetchMovies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get("/api/movie/movie-with-show");
      console.log("hjfsd", response);
      setList(response.data.data);
    } catch (error) {
      console.log(error);
      setError("Failed to fetch movies. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMovies();
  }, []);

  if (loading) {
    return <Loader />;
  }
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

            <div className="max-w-[85%] mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {list?.map((data) => (
                  <MovieCard
                    data={data}
                    key={data.id}
                    selectedCity={selectedCity}
                    setLoading={setLoading}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {error && (
        <div className="text-center py-6 text-red-600 bg-red-100 rounded-lg mx-auto max-w-md">
          <p className="font-semibold">Oops! Something went wrong.</p>
          <p>{error}</p>
        </div>
      )}
    </>
  );
}

export default ShowMovieList;
