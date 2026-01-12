"use client";
import { MovieType } from "@/types/movieType";
import React, { useEffect, useState, useCallback } from "react";
import MovieCard from "./MovieCard";
import { Film, Filter, X } from "lucide-react";
import { RootState } from "@/GlobalState/store";
import { useDispatch, useSelector } from "react-redux";
import { setMovieSearch } from "@/GlobalState/slices/searchMovieSlice";
import { MovieGridSkeleton } from "./MovieSkeleton";

interface MovieResponse {
  data: MovieType[];
  hasMore: boolean;
}

function MovieList() {
  const dispatch = useDispatch();
  const [list, setList] = useState<MovieType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string>("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const { selectedCity } = useSelector((state: RootState) => state?.city);
  const movieSearch = useSelector((state: RootState) => state.search);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [activeCategory, setActiveCategory] = useState("nowShowing");

  const genreOptions = [
    "All Genres",
    "Comedy",
    "Crime",
    "Drama",
    "Romance",
    "History",
    "Biography",
    "War",
  ];

  const moviesPerPage = 6;

  const fetchMovies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: moviesPerPage.toString(),
        genre: selectedGenre,
        language: selectedLanguage,
        search: movieSearch,
      }).toString();

      const response = await fetch(`/api/movie?${queryParams}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData: MovieResponse = await response.json();
      const { data, hasMore } = responseData;
      setList((prev) => (page === 1 ? data : [...prev, ...data]));
      setHasMore(hasMore);
    } catch (error) {
      console.error("Failed to fetch movies:", error);
      setError("Failed to fetch movies. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [page, selectedGenre, selectedLanguage, movieSearch]);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  useEffect(() => {
    setList([]);
    setPage(1);
  }, [selectedCity, selectedGenre, selectedLanguage, movieSearch]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition =
        window.innerHeight + document.documentElement.scrollTop;
      const triggerPoint = document.documentElement.offsetHeight - 100;
      if (scrollPosition >= triggerPoint && !loading && hasMore) {
        setPage((prev) => prev + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore]);

  const resetFilters = () => {
    if (selectedGenre !== "" || selectedLanguage !== "" || movieSearch !== "") {
      dispatch(setMovieSearch(""));
      setSelectedGenre("");
      setSelectedLanguage("");
      setPage(1);
      setList([]);
    }
  };

  const initialLoading = loading && page === 1;
  const isFiltersActive =
    selectedGenre !== "" || selectedLanguage !== "" || movieSearch !== "";

  return (
    <section className="bg-gray-50/50 dark:bg-gray-950 min-h-screen py-10 w-full transition-colors duration-300">
      <div className="w-full pl-6 md:pl-24 xl:pl-0 mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 border-b border-gray-200 dark:border-gray-800 pb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-pink-100 dark:bg-pink-900/20 rounded-lg">
              <Film className="h-6 w-6 text-pink-600 dark:text-pink-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              Now Showing
            </h1>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center items-stretch gap-3 w-full sm:w-auto">
              {/* Genre Select */}
              <div className="relative group">
                <select
                  className="block w-full sm:w-40 pl-3 pr-8 py-2.5 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all outline-none appearance-none cursor-pointer text-gray-700 dark:text-gray-200 font-medium shadow-sm hover:border-gray-300 dark:hover:border-gray-700"
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                >
                  {genreOptions?.map((genre) => (
                    <option
                      key={genre}
                      value={genre === "All Genres" ? "" : genre}
                      className="dark:bg-gray-900"
                    >
                      {genre}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-gray-400">
                  <Filter className="h-3.5 w-3.5" />
                </div>
              </div>

              {/* Language Select */}
              <div className="relative group">
                <select
                  className="block w-full sm:w-40 pl-3 pr-8 py-2.5 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all outline-none appearance-none cursor-pointer text-gray-700 dark:text-gray-200 font-medium shadow-sm hover:border-gray-300 dark:hover:border-gray-700"
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                >
                  <option value="" className="dark:bg-gray-900">All Languages</option>
                  <option value="Hindi" className="dark:bg-gray-900">Hindi</option>
                  <option value="English" className="dark:bg-gray-900">English</option>
                  <option value="Telugu" className="dark:bg-gray-900">Telugu</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-gray-400">
                  <Filter className="h-3.5 w-3.5" />
                </div>
              </div>

              {/* Reset Button */}
              <button
                onClick={resetFilters}
                disabled={!isFiltersActive}
                className={`flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isFiltersActive
                    ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 shadow-md transform hover:-translate-y-0.5"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                  }`}
                aria-label="Reset filters"
              >
                <X className={`h-4 w-4 ${isFiltersActive ? "mr-2" : ""}`} />
                {isFiltersActive && "Reset"}
              </button>
            </div>
          </div>
        </div>

        {/* Content Section */}
        {initialLoading ? (
          <MovieGridSkeleton count={8} />
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-full mb-4">
              <Film className="h-10 w-10 text-red-500 dark:text-red-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Failed to load movies</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">{error}</p>
            <button onClick={() => window.location.reload()} className="px-6 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-full font-medium transition-colors">
              Try Again
            </button>
          </div>
        ) : list?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
            {list.map((data) => (
              <div key={data.id} className="flex justify-center">
                <MovieCard
                  data={data}
                  selectedCity={selectedCity}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in zoom-in duration-500">
            <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-full mb-4">
              <Film className="h-12 w-12 text-gray-400 dark:text-gray-500 opacity-50" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">No movies found</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              We couldn't find any movies matching your filters. Try adjusting your search or filters to find what you're looking for.
            </p>
            {isFiltersActive && (
              <button onClick={resetFilters} className="mt-6 px-6 py-2.5 text-pink-600 font-medium hover:bg-pink-50 dark:hover:bg-pink-900/10 rounded-lg transition-colors">
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Load More Spinner */}
        {loading && !initialLoading && (
          <div className="flex justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin"></div>
              <span className="text-sm font-medium text-pink-600 dark:text-pink-400 animate-pulse">Loading more movies...</span>
            </div>
          </div>
        )}

        {/* End of results */}
        {!hasMore && list?.length > 0 && (
          <div className="py-12 text-center border-t border-gray-200 dark:border-gray-800 mt-12">
            <p className="text-gray-400 dark:text-gray-600 text-sm font-medium uppercase tracking-widest">End of list</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default MovieList;
