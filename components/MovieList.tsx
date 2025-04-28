"use client";
import { MovieType } from "@/types/movieType";
import React, { useEffect, useState, useCallback } from "react";
import MovieCard from "./MovieCard";
import { Film } from "lucide-react";
import Loader from "./Loader";
import { RootState } from "@/GlobalState/store";
import { useDispatch, useSelector } from "react-redux";
import { setMovieSearch } from "@/GlobalState/slices/searchMovieSlice";

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
        next: { revalidate: 10 * 60 * 60 },
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

  if (loading && page === 1) {
    return <Loader />;
  }

  return (
    <>
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="w-full pt-2 pl-16 md:pl-24 xl:pl-0 transition-all duration-300">
          <div className="mx-auto px-4 sm:px-6 lg:px-8 pb-16">
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
                  Movies
                </button>
              </div>
              <div className="flex space-x-4 items-center">
                <select
                  className="bg-transparent border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm"
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                >
                  {genreOptions?.map((genre) => (
                    <option
                      key={genre}
                      value={genre === "All Genres" ? "" : genre}
                    >
                      {genre}
                    </option>
                  ))}
                </select>
                <select
                  className="bg-transparent border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm"
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                >
                  <option value="">All Languages</option>
                  <option>Hindi</option>
                  <option>English</option>
                  <option>Telugu</option>
                </select>
                <button
                  disabled={
                    selectedGenre === "" &&
                    selectedLanguage === "" &&
                    movieSearch === ""
                  }
                  onClick={resetFilters}
                  className="bg-pink-600 text-white px-4 py-2 rounded-md text-sm hover:bg-pink-700 transition-colors disabled:bg-pink-300"
                >
                  Reset Filters
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
      {loading && page > 1 && (
        <div className="text-center py-6">
          <div className="flex items-center justify-center gap-3">
            <svg
              className="animate-spin h-6 w-6 text-blue-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
              />
            </svg>
            <span className="text-gray-700 font-semibold text-lg">
              Loading more...
            </span>
          </div>
        </div>
      )}
      {!hasMore && list?.length > 0 && (
        <div className="text-center py-4">No more movies to load</div>
      )}
    </>
  );
}

export default MovieList;
