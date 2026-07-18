"use client";

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Film, Ticket } from "lucide-react";

import { RootState } from "@/GlobalState/store";
import { MovieType } from "@/types/movieType";

import MovieCard from "./MovieCard";
import { MovieGridSkeleton } from "./MovieSkeleton";

function ShowMovieList() {
  const { selectedCity } = useSelector((state: RootState) => state.city);

  const [list, setList] = useState<MovieType[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    if (!selectedCity) {
      setList([]);
      return;
    }

    setLoading(true);
    const controller = new AbortController();

    async function fetchMovies() {
      try {
        const response = await fetch(
          `/api/movie/movie-with-show?city=${encodeURIComponent(selectedCity ?? "")}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch movies`);
        }

        const data = await response.json();
        setList(data.data ?? []);
        setLoading(false);
      } catch (error: any) {
        if (error.name !== "AbortError") {
          console.error("Error fetching movies:", error);
          setList([]);
          setLoading(false);
        }
      }
    }

    fetchMovies();

    return () => controller.abort();
  }, [selectedCity]);

  /** No city selected (important) */
  if (!selectedCity) {
    return null; // Home will handle CityPanel
  }

  return (
    <section className="bg-gray-50/50 dark:bg-gray-950 mb-10 transition-colors duration-300">
      <div className="w-full pl-6 md:pl-24 xl:pl-0 mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-center space-x-3 mb-8 border-b border-gray-200 dark:border-gray-800 pb-4">
          <div className="p-2 bg-pink-100 dark:bg-pink-900/20 rounded-lg">
            <Ticket className="h-6 w-6 text-pink-600 dark:text-pink-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Book Tickets in <span className="text-pink-600 dark:text-pink-500">{selectedCity?.charAt(0).toUpperCase() + selectedCity?.slice(1)}</span>
          </h2>
        </div>

        {/* Content */}
        {loading ? (
          <MovieGridSkeleton count={4} />
        ) : list.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {list.map((movie) => (
              <div key={movie.id} className="flex justify-center">
                <MovieCard
                  data={movie}
                  selectedCity={selectedCity}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm mt-4">
            <div className="bg-gray-100 dark:bg-gray-800 p-5 rounded-full mb-4">
              <Film className="h-10 w-10 text-gray-400 dark:text-gray-500 opacity-60" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">No shows available</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
              There are currently no shows available in {selectedCity}. Try checking back later or select a different city.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default ShowMovieList;
