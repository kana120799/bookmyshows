"use client";

import MovieDetails from "@/components/MovieDetails";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { RootState } from "@/GlobalState/store";
import { useSelector } from "react-redux";
import Loader from "@/components/Loader";
import axios from "axios";

interface MovieData {
  id: string;
  title: string;
  description: string;
  rating: number;
  voteCount: number;
  duration: string;
  genres: string[];
  releaseDate: string;
  language: string;
  ageRating: string;
  Poster: string;
  selectedCity: string;
}

export default function Page() {
  const { id: movieId } = useParams<{ id: string }>();
  const [movieData, setMovieData] = useState<MovieData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { selectedCity } = useSelector((state: RootState) => state.city);
  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        setLoading(true);

        const response = await axios.get(`/api/movie/${movieId}`);
        setMovieData(response.data.data);
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
      <MovieDetails
        id={movieData.id}
        title={movieData.title}
        description={movieData.description}
        rating={movieData.rating}
        voteCount={movieData.voteCount}
        duration={movieData.duration}
        genres={movieData.genres}
        releaseDate={movieData.releaseDate}
        language={movieData.language}
        ageRating={movieData.ageRating}
        Poster={movieData.Poster}
        selectedCity={selectedCity}
      />
    </>
  );
}
