// "use client";
// import { MovieType } from "@/types/movie";
// import api from "@/utils/axios-interceptor";
// import React, { useEffect, useState } from "react";
// import MovieCard from "./MovieCard";

// function MovieList({ selectedCity }: { selectedCity: string }) {
//   const [list, setList] = useState<MovieType[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);

//   useEffect(() => {
//     const fetchMovie = async () => {
//       try {
//         setLoading(true);
//         // const response = await axios.post<NewUser>('/users', formData);
//         const response = await axios.get("/api/movie");
//         setList(response.data);
//       } catch (error) {
//         console.error("Failed to fetch movies:", error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchMovie();
//   }, []);

//   if (loading) {
//     return <div>Load...</div>;
//   }

//   return (
//     <div className="flex">
//       {list?.map((data) => (
//         <MovieCard data={data} key={data.id} selectedCity={selectedCity} />
//       ))}
//     </div>
//   );
// }

// export default MovieList;

"use client";

import Loader from "@/components/Loader";
import { MovieType } from "@/types/movieType";
import axios from "axios";
import Image from "next/image";
import React, { useEffect, useState, useCallback } from "react";

function MovieAdminList() {
  const [list, setList] = useState<MovieType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const moviesPerPage = 6;

  const fetchMovies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get("/api/movie", {
        params: {
          page: page,
          limit: moviesPerPage,
        },
      });

      const { data, hasMore } = response.data;
      setList((prev) => (page === 1 ? data : [...prev, ...data]));
      setHasMore(hasMore);
    } catch (error) {
      console.error("Failed to fetch movies:", error);
      setError("Failed to fetch movies. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  useEffect(() => {
    // Reset list and page when selectedCity changes
    setList([]);
    setPage(1);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
          document.documentElement.offsetHeight - 50 &&
        !loading &&
        hasMore
      ) {
        setPage((prev) => prev + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore, list]);

  return (
    <div className="p-5">
      <div className="grid grid-cols-3 gap-4 md:grid-cols-3 sm:grid-cols-1">
        {loading && <Loader />}
        {list?.map((data) => (
          <div
            className="max-w-sm rounded-lg overflow-hidden shadow-lg bg-white border border-gray-200 "
            key={data.id}
          >
            <div className="relative">
              <Image
                src={data.Poster}
                alt={` poster`}
                className="w-full h-full object-cover"
                width={100}
                height={80}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2">
                <span className="text-sm text-black font-bold">7/10</span>
                <span className="text-xs text-black"> 11.2K Votes</span>
              </div>
            </div>
            <div className="p-4">
              <h2 className="text-xl font-bold mb-2">{data.title}</h2>
              <p className="text-gray-700 text-base">Action/Adventure/Sci-Fi</p>
            </div>
          </div>
        ))}
      </div>
      {error && <div className="text-center py-4 text-red-500">{error}</div>}
      {!hasMore && list.length > 0 && (
        <div className="text-center py-4">No more movies to load</div>
      )}
    </div>
  );
}

export default MovieAdminList;
