"use client";

import MovieDetails from "@/components/MovieDetails";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { RootState } from "@/GlobalState/store";
import { useSelector } from "react-redux";
import Loader from "@/components/Loader";
import { useSession } from "next-auth/react";
import MovieDetailWrapper from "@/components/MovieDetailWrapper";

interface MovieData {
  id: string;
  title: string;
  description: string;
  rating: number;
  voteCount: number;
  durationMins: number;
  genres: string[];
  releaseDate: string;
  language: string;
  ageRating: string;
  Poster: string;
  selectedCity: string;
  country: string;
  Year: number;
  Director: string[];
  Actors: string[];
}

export default function Page() {
  const { id: movieId } = useParams<{ id: string }>();
  const [movieData, setMovieData] = useState<MovieData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { selectedCity } = useSelector((state: RootState) => state.city);
  const { data: session } = useSession();

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        setLoading(true);

        const response = await fetch(`/api/movie/${movieId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          next: { revalidate: 10 * 60 * 60 },
        });
        const responseData = await response.json();
        setMovieData(responseData.data);
      } catch (err) {
        console.error("Failed to fetch movie details:", err);
        setError("Could not load movie details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (movieId) {
      fetchMovieDetails();
    }
  }, [movieId]);
  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  if (!movieData) {
    return <div className="text-center py-10">No movie data found.</div>;
  }

  return (
    <>
      <MovieDetailWrapper>
        <MovieDetails
          id={movieData.id}
          title={movieData.title}
          description={movieData.description}
          rating={movieData.rating}
          voteCount={movieData.voteCount}
          durationMins={movieData.durationMins}
          genre={movieData.genres}
          releaseDate={movieData.releaseDate}
          language={movieData.language}
          ageRating={movieData.ageRating}
          Poster={movieData.Poster}
          Director={movieData.Director}
          Actors={movieData.Actors}
          country={movieData.country}
          Year={movieData.Year}
          selectedCity={selectedCity}
          session={
            session as
              | { user: { name: string; email: string; role: string } }
              | undefined
          }
        />
      </MovieDetailWrapper>
    </>
  );
}
