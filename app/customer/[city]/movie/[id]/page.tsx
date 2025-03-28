"use client";

import MovieDetails from "@/components/MovieDetails";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { RootState } from "@/GlobalState/store";
import { useSelector } from "react-redux";
import Loader from "@/components/Loader";
import axios from "axios";
import { useSession } from "next-auth/react";

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
        session={session}
      />
      {/* <MovieDetails
        id="1"
        title="Chhaava"
        description="A captivating historical drama following the journey of a warrior through extraordinary circumstances, blending emotion, action, and unforgettable moments. The film showcases spectacular battle sequences and emotional depth as it explores themes of loyalty, sacrifice, and honor in a turbulent time."
        rating={9.3}
        voteCount={180000}
        durationMins={161}
        genre={["Action", "Drama", "Historical"]}
        releaseDate="2023-12-01"
        language="Hindi"
        ageRating="UA16+"
        Poster="https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1925&auto=format&fit=crop"
        Director={["Rajesh Kumar", "Priya Singh"]}
        Actors={["Vicky Kaushal", "Rashmika Mandanna", "Akshaye Khanna"]}
        country="India"
        Year={2023}
      /> */}
    </>
  );
}
