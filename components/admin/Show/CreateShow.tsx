"use client";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

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
  const [error, setError] = useState<string | null>(null);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Search movies handler
  const handleMovieSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    if (query.length > 2) {
      debounceTimeout.current = setTimeout(async () => {
        setLoading(true);
        try {
          const response = await axios.get(`/api/movie?search=${query}`);
          const filteredData = response.data.data?.map(
            ({ id, title }: { id: string; title: string }) => ({ id, title })
          );
          setMovies(filteredData as Movie[]);
        } catch (error) {
          console.error("Error fetching movies:", error);
          setError("Failed to fetch movies.");
        } finally {
          setLoading(false);
        }
      }, 500);
    } else {
      setMovies([]);
    }
  };

  // Cleanup debounce
  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

  const handleFetchHalls = async () => {
    if (!cinemaId) {
      setError("Please enter a Cinema ID.");
      return;
    }
    setLoading(true);
    setError(null);
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
      setError("Failed to fetch halls.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!selectedMovie || !selectedHall || !startTime) {
      setError("Please select a movie, hall, and start time.");
      return;
    }

    const showData: ShowData = {
      movieId: selectedMovie.id,
      cinemaHallId: selectedHall.id,
      startTime: new Date(startTime).toISOString(),
    };

    setLoading(true);
    setError(null);
    try {
      const response = await axios.post("/api/admin/show", showData);
      if (response.statusText === "OK") {
        router.push("/admin/show");
      }
    } catch (error) {
      console.error("Error creating show:", error);
      setError("Failed to create show.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Add New Show</h2>

        <div className="space-y-8">
          {/* Movie Selection */}
          <section>
            <label
              htmlFor="movie-search"
              className="block text-xl font-medium text-gray-700 mb-2"
            >
              Search Movie
            </label>
            <input
              id="movie-search"
              type="text"
              value={searchQuery}
              onChange={handleMovieSearch}
              placeholder="Search for a movie..."
              className="w-full h-12 px-4 rounded-md border text-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              disabled={loading}
            />
            {loading && searchQuery && (
              <p className="mt-2 text-sm text-gray-500">Loading... </p>
            )}
            {movies.length > 0 && (
              <div className="mt-2 max-h-40 overflow-y-auto border rounded-md bg-gray-50">
                {movies.map((movie) => (
                  <div
                    key={movie.id}
                    onClick={() => {
                      setSelectedMovie(movie);
                      setMovies([]);
                      setSearchQuery("");
                    }}
                    className="p-3 hover:bg-gray-100 cursor-pointer text-gray-700"
                  >
                    {movie.title}
                  </div>
                ))}
              </div>
            )}
            {selectedMovie && (
              <div className="mt-4 p-4 bg-gray-50 rounded-md flex justify-between items-center">
                <p className="text-xl font-semibold text-gray-800">
                  Selected Movie: {selectedMovie.title}
                </p>
                <button
                  onClick={() => setSelectedMovie(null)}
                  className="text-red-600 hover:text-red-800 font-medium text-lg"
                >
                  Remove
                </button>
              </div>
            )}
          </section>

          {/* Cinema Hall Selection */}
          <section>
            <label
              htmlFor="cinema-id"
              className="block text-xl font-medium text-gray-700 mb-2"
            >
              Cinema ID
            </label>
            <div className="flex gap-4">
              <input
                id="cinema-id"
                type="text"
                value={cinemaId}
                onChange={(e) => setCinemaId(e.target.value)}
                placeholder="Enter Cinema ID"
                className="flex-1 h-12 px-4 rounded-md border border-gray-300 shadow-sm text-xl focus:border-indigo-500 focus:ring-indigo-500"
                disabled={loading}
              />
              <button
                onClick={handleFetchHalls}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-lg disabled:bg-blue-400 transition-colors"
                disabled={loading}
              >
                {loading ? "Fetching..." : "Fetch Halls"}
              </button>
            </div>

            {halls.length > 0 && !selectedHall && (
              <div className="mt-4 max-h-40 overflow-y-auto border rounded-md bg-gray-50">
                {halls.map((hall) => (
                  <div
                    key={hall.id}
                    onClick={() => setSelectedHall(hall)}
                    className="p-3 hover:bg-gray-100 cursor-pointer text-gray-700"
                  >
                    {hall.name} (Seats: {hall.totalSeats})
                  </div>
                ))}
              </div>
            )}
            {selectedHall && (
              <div className="mt-4 p-4 bg-gray-50 rounded-md flex justify-between items-center">
                <p className="text-xl font-semibold text-gray-800">
                  Selected Hall: {selectedHall.name} ({selectedHall.totalSeats}{" "}
                  seats)
                </p>
                <button
                  onClick={() => setSelectedHall(null)}
                  className="text-red-600 hover:text-red-800 font-medium text-lg"
                >
                  Remove
                </button>
              </div>
            )}
          </section>

          {/* Show Time */}
          <section>
            <label
              htmlFor="start-time"
              className="block text-xl font-medium text-gray-700 mb-2"
            >
              Show Start Time
            </label>
            <input
              id="start-time"
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full h-12 px-4 rounded-md border border-gray-300 text-xl shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              disabled={loading}
            />
          </section>

          {/* Feedback and Actions */}
          {error && (
            <div className="p-4 bg-red-100 text-red-700 rounded-md">
              <p>{error}</p>
            </div>
          )}
          <div className="flex gap-4">
            <button
              onClick={handleSubmit}
              className="flex-1 px-4 py-3 bg-indigo-600 text-lg text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Show"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/admin/show")}
              className="flex-1 px-4 py-3 bg-gray-600 text-lg text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// "use client";
// import axios from "axios";
// import { useRouter } from "next/navigation";
// import { useEffect, useRef, useState } from "react";

// // Define types for Movie and Hall
// interface Movie {
//   id: string;
//   title: string;
// }

// interface Hall {
//   id: string;
//   name: string;
//   totalSeats: number;
// }

// interface ShowData {
//   movieId: string;
//   cinemaHallId: string;
//   startTime: string;
// }

// export default function CreateShow() {
//   const router = useRouter();
//   const [searchQuery, setSearchQuery] = useState<string>("");
//   const [cinemaId, setCinemaId] = useState<string>("");
//   const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
//   const [selectedHall, setSelectedHall] = useState<Hall | null>(null);
//   const [startTime, setStartTime] = useState<string>("");
//   const [movies, setMovies] = useState<Movie[]>([]);
//   const [halls, setHalls] = useState<Hall[]>([]);
//   const [loading, setLoading] = useState<boolean>(false);
//   const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

//   // Search movies handler
//   const handleMovieSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const query = e.target.value;
//     setSearchQuery(query);

//     // reset the debounce
//     if (debounceTimeout.current) {
//       clearTimeout(debounceTimeout.current);
//     }

//     // Only proceed if query length is > 2
//     if (query.length > 2) {
//       debounceTimeout.current = setTimeout(async () => {
//         setLoading(true);
//         try {
//           const response = await axios.get(`/api/movie?search=${query}`);
//           const filteredData = response.data.data?.map(
//             ({ id, title }: { id: string; title: string }) => ({
//               id,
//               title,
//             })
//           );
//           setMovies(filteredData as Movie[]);
//         } catch (error) {
//           console.error("Error fetching movies:", error);
//         }
//         setLoading(false);
//       }, 500);
//     } else {
//       setMovies([]);
//     }
//   };
//   // Cleanup
//   useEffect(() => {
//     return () => {
//       if (debounceTimeout.current) {
//         clearTimeout(debounceTimeout.current);
//       }
//     };
//   }, []);

//   const handleFetchHalls = async () => {
//     if (!cinemaId) return;
//     setLoading(true);
//     try {
//       const response = await axios.get(`/api/admin/hall?cinemaId=${cinemaId}`);
//       const filteredData = response.data?.map(
//         ({
//           id,
//           name,
//           totalSeats,
//         }: {
//           id: string;
//           name: string;
//           totalSeats: number;
//         }) => ({
//           id,
//           name,
//           totalSeats,
//         })
//       );

//       setHalls((filteredData as Hall[]) || []);
//     } catch (error) {
//       console.error("Error fetching halls:", error);
//     }
//     setLoading(false);
//   };

//   const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
//     e.preventDefault();
//     setLoading(false);
//     if (!selectedMovie || !selectedHall || !startTime) {
//       alert("Please select movie, hall, and start time");
//       return;
//     }

//     const showData: ShowData = {
//       movieId: selectedMovie.id,
//       cinemaHallId: selectedHall.id,
//       startTime: new Date(startTime).toISOString(),
//     };

//     try {
//       const response = await axios.post("/api/admin/show", showData);
//       if (response.statusText === "OK") {
//         router.push("/admin/show");
//       }
//     } catch (error) {
//       console.error("Error creating show:", error);
//       alert("Failed to create show");
//     } finally {
//       setLoading(true);
//     }
//   };

//   return (
//     <div className="max-w-2xl mx-auto  p-6 bg-white rounded-lg mt-10 shadow-md">
//       <h2 className="text-2xl font-bold mb-6 text-gray-800">Add New Show</h2>

//       {selectedMovie && (
//         <div className="mb-6 p-4 bg-gray-100 rounded-lg">
//           <p className="font-semibold text-xl">
//             Selected Movie: {selectedMovie.title}
//           </p>
//           <button
//             onClick={() => setSelectedMovie(null)}
//             className="text-red-500 text-xl mt-2"
//           >
//             Remove
//           </button>
//         </div>
//       )}

//       {/* Movie Search */}
//       <div className="mb-6">
//         <label className="block text-gray-700 font-medium mb-2 text-xl">
//           Search Movie
//         </label>
//         <input
//           type="text"
//           value={searchQuery}
//           onChange={handleMovieSearch}
//           placeholder="Search for a movie..."
//           className="w-full p-2 border rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
//         />

//         {movies.length > 0 && (
//           <div className="mt-2 max-h-40 overflow-y-auto border rounded-md">
//             {movies?.map((movie) => (
//               <div
//                 key={movie.id}
//                 onClick={() => {
//                   setSelectedMovie(movie);
//                   setMovies([]);
//                   setSearchQuery("");
//                 }}
//                 className="p-2 hover:bg-gray-100 cursor-pointer"
//               >
//                 {movie.title}
//               </div>
//             ))}
//           </div>
//         )}
//         {loading && searchQuery && <span>Loading ...</span>}
//       </div>

//       {/* Cinema Hall Selection */}
//       <div className="mb-6">
//         <label className="block text-gray-700 font-medium mb-2 text-xl">
//           Cinema ID
//         </label>
//         <div className="flex gap-2">
//           <input
//             type="text"
//             value={cinemaId}
//             onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
//               setCinemaId(e.target.value)
//             }
//             placeholder="Enter Cinema ID"
//             className="flex-1 p-2 border rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
//           />
//           <button
//             onClick={handleFetchHalls}
//             className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-400 "
//             disabled={loading}
//           >
//             Fetch Halls
//           </button>
//         </div>

//         {/* Selected Hall Display */}
//         {selectedHall && (
//           <div className="mt-4 p-4 bg-gray-100 rounded-lg">
//             <p className="font-semibold text-xl">
//               Selected Hall: {selectedHall.name}
//             </p>
//             <button
//               onClick={() => setSelectedHall(null)}
//               className="text-red-500 text-xl mt-2"
//             >
//               Remove
//             </button>
//           </div>
//         )}

//         {halls.length > 0 && !selectedHall && (
//           <div className="mt-2 max-h-40 overflow-y-auto border rounded-md">
//             {halls?.map((hall) => (
//               <div
//                 key={hall.id}
//                 onClick={() => setSelectedHall(hall)}
//                 className="p-2 hover:bg-gray-100 cursor-pointer"
//               >
//                 {hall.name} (Seats: {hall.totalSeats})
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* Show Time */}
//       <div className="mb-6">
//         <label className="block text-gray-700 font-medium mb-2 text-xl">
//           Show Start Time
//         </label>
//         <input
//           type="datetime-local"
//           value={startTime}
//           onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
//             setStartTime(e.target.value)
//           }
//           className="w-full p-2 border rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
//         />
//       </div>

//       {/* Submit Button */}
//       <button
//         onClick={handleSubmit}
//         className="w-full py-2 mt-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
//         disabled={loading}
//       >
//         Create Show
//       </button>
//       <button
//         type="button"
//         onClick={() => router.push("/admin/show")}
//         className="w-full py-2 mt-5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
//         disabled={loading}
//       >
//         Back
//       </button>
//     </div>
//   );
// }
