"use client";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// Define types for Movie and Hall
interface Movie {
  id: string;
  title: string;
}

interface Hall {
  id: string;
  name: string;
  totalSeats: number;
}

interface ShowData {
  movieId: string;
  cinemaHallId: string;
  startTime: string;
}

export default function CreateShow() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [cinemaId, setCinemaId] = useState<string>("");
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [selectedHall, setSelectedHall] = useState<Hall | null>(null);
  const [startTime, setStartTime] = useState<string>("");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [halls, setHalls] = useState<Hall[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Search movies handler
  const handleMovieSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    // reset the debounce
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    // Only proceed if query length is > 2
    if (query.length > 2) {
      debounceTimeout.current = setTimeout(async () => {
        setLoading(true);
        try {
          const response = await axios.get(`/api/movie?search=${query}`);
          const filteredData = response.data.data?.map(
            ({ id, title }: { id: string; title: string }) => ({
              id,
              title,
            })
          );
          setMovies(filteredData as Movie[]);
        } catch (error) {
          console.error("Error fetching movies:", error);
        }
        setLoading(false);
      }, 500);
    } else {
      setMovies([]);
    }
  };
  // Cleanup
  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

  const handleFetchHalls = async () => {
    if (!cinemaId) return;
    setLoading(true);
    try {
      const response = await axios.get(`/api/admin/hall?cinemaId=${cinemaId}`);
      const filteredData = response.data?.map(
        ({
          id,
          name,
          totalSeats,
        }: {
          id: string;
          name: string;
          totalSeats: number;
        }) => ({
          id,
          name,
          totalSeats,
        })
      );

      setHalls((filteredData as Hall[]) || []);
    } catch (error) {
      console.error("Error fetching halls:", error);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setLoading(false);
    if (!selectedMovie || !selectedHall || !startTime) {
      alert("Please select movie, hall, and start time");
      return;
    }

    const showData: ShowData = {
      movieId: selectedMovie.id,
      cinemaHallId: selectedHall.id,
      startTime: new Date(startTime).toISOString(),
    };

    try {
      const response = await axios.post("/api/admin/show", showData);
      if (response.statusText === "OK") {
        router.push("/admin/show");
      }
    } catch (error) {
      console.error("Error creating show:", error);
      alert("Failed to create show");
    } finally {
      setLoading(true);
    }
  };

  return (
    <div className="max-w-2xl mx-auto  p-6 bg-white rounded-lg mt-10 shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Add New Show</h2>

      {selectedMovie && (
        <div className="mb-6 p-4 bg-gray-100 rounded-lg">
          <p className="font-semibold text-xl">
            Selected Movie: {selectedMovie.title}
          </p>
          <button
            onClick={() => setSelectedMovie(null)}
            className="text-red-500 text-lg mt-2"
          >
            Remove
          </button>
        </div>
      )}

      {/* Movie Search */}
      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2 text-xl">
          Search Movie
        </label>
        <input
          type="text"
          value={searchQuery}
          onChange={handleMovieSearch}
          placeholder="Search for a movie..."
          className="w-full p-2 border rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />

        {movies.length > 0 && (
          <div className="mt-2 max-h-40 overflow-y-auto border rounded-md">
            {movies?.map((movie) => (
              <div
                key={movie.id}
                onClick={() => {
                  setSelectedMovie(movie);
                  setMovies([]);
                  setSearchQuery("");
                }}
                className="p-2 hover:bg-gray-100 cursor-pointer"
              >
                {movie.title}
              </div>
            ))}
          </div>
        )}
        {loading && searchQuery && <span>Loading ...</span>}
      </div>

      {/* Cinema Hall Selection */}
      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2 text-xl">
          Cinema ID
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={cinemaId}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setCinemaId(e.target.value)
            }
            placeholder="Enter Cinema ID"
            className="flex-1 p-2 border rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          <button
            onClick={handleFetchHalls}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-400 "
            disabled={loading}
          >
            Fetch Halls
          </button>
        </div>

        {/* Selected Hall Display */}
        {selectedHall && (
          <div className="mt-4 p-4 bg-gray-100 rounded-lg">
            <p className="font-semibold text-xl">
              Selected Hall: {selectedHall.name}
            </p>
            <button
              onClick={() => setSelectedHall(null)}
              className="text-red-500 text-lg mt-2"
            >
              Remove
            </button>
          </div>
        )}

        {halls.length > 0 && !selectedHall && (
          <div className="mt-2 max-h-40 overflow-y-auto border rounded-md">
            {halls.map((hall) => (
              <div
                key={hall.id}
                onClick={() => setSelectedHall(hall)}
                className="p-2 hover:bg-gray-100 cursor-pointer"
              >
                {hall.name} (Seats: {hall.totalSeats})
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Show Time */}
      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2 text-xl">
          Show Start Time
        </label>
        <input
          type="datetime-local"
          value={startTime}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setStartTime(e.target.value)
          }
          className="w-full p-2 border rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        className="w-full py-2 mt-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
        disabled={loading}
      >
        Create Show
      </button>
      <button
        type="button"
        onClick={() => router.push("/admin/show")}
        className="w-full py-2 mt-5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
        disabled={loading}
      >
        Back
      </button>
    </div>
  );
}
