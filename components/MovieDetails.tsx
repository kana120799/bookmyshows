import React from "react";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Share2, Star, Calendar, Globe, User, Film } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

interface MovieDetailsProps {
  id: string;
  title: string;
  description: string;
  rating?: number;
  voteCount?: number;
  durationMins?: number;
  genre?: string[];
  releaseDate?: string;
  language?: string;
  ageRating?: string;
  Poster?: string;
  Director?: string[];
  Actors?: string[];
  country?: string;
  Year?: number;
  selectedCity?: string;
  session?: {
    user: {
      name: string;
      email: string;
      role: string;
    };
  };
}

function MovieDetails({
  id = "movie-id",
  description = "A captivating story that follows the journey of remarkable characters through extraordinary circumstances.",
  title = "Movie Title",
  rating = 8.5,
  voteCount = 10000,
  durationMins = 161,
  genre = ["Action", "Drama", "Historical"],
  releaseDate = "2023-12-01",
  language = "English",
  ageRating = "PG-13",
  Poster = "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1925&auto=format&fit=crop",
  Director = ["Christopher Nolan"],
  Actors = ["John Doe", "Jane Smith", "Robert Johnson"],
  country = "United States",
  Year = 2023,
  selectedCity = "mumbai",
  session,
}: MovieDetailsProps) {
  // Format duration from minutes to hours and minutes
  const formatDuration = (mins: number) => {
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    return `${hours}h ${minutes > 0 ? `${minutes}m` : ""}`;
  };

  const duration = durationMins ? formatDuration(durationMins) : "2h 30m";

  const formattedDate = releaseDate
    ? new Date(releaseDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "December 1, 2023";

  return (
    <div className="flex flex-col w-full">
      <div className="relative rounded-lg overflow-hidden">
        <div className="absolute inset-0 w-full h-full">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: Poster
                ? `url(${Poster})`
                : "linear-gradient(135deg, #9b87f5 0%, #6E59A5 100%)",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/40" />
        </div>

        <div className="relative z-10 container mx-auto flex flex-col md:flex-row py-12 px-4 md:px-6 text-white min-h-[500px]">
          {/* Movie poster */}
          <div className="w-full md:w-1/3 flex flex-col items-center md:items-start">
            <div className="w-full max-w-[280px] aspect-[2/3] rounded-lg overflow-hidden shadow-2xl mb-6 ring-1 ring-white/20">
              <div
                className="w-full h-full bg-cover bg-center"
                style={{
                  backgroundImage: Poster
                    ? `url(${Poster})`
                    : "linear-gradient(135deg, #9b87f5 0%, #6E59A5 100%)",
                }}
              />
            </div>

            {/* Trailer button */}
            {/* <Button
              variant="outline"
              className="w-full max-w-[280px] bg-black/30 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all h-11 "
            >
              <div className="mr-2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[10px] border-l-white"></div>
              Watch Trailer
            </Button> */}
          </div>

          <div className="w-full md:w-2/3 md:pl-8 mt-8 md:mt-0 flex flex-col">
            <h1 className="text-3xl md:text-5xl font-bold mb-3">{title}</h1>

            <div className="flex items-center gap-3 text-gray-300 mb-4">
              <span className="text-lg">{Year}</span>
              {ageRating && (
                <span className="px-2 py-1 bg-white/10 backdrop-blur-sm rounded text-lg border border-white/10">
                  {ageRating}
                </span>
              )}
              <span>{duration}</span>
            </div>

            <div className="flex items-center gap-2 mb-6">
              <div className="flex items-center justify-center bg-yellow-500/90 rounded-md p-1 px-2">
                <Star className="w-5 h-5 text-white mr-1 fill-white" />
                <span className="text-white font-bold">
                  {rating.toFixed(1)}
                </span>
              </div>
              {voteCount > 0 && (
                <span className="text-gray-400 text-lg">
                  {voteCount.toLocaleString()} votes
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {genre?.map((g, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-md text-lg"
                >
                  {g}
                </span>
              ))}
            </div>

            <div className="space-y-3 mb-6 text-gray-300 text-lg">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span>Released: {formattedDate}</span>
              </div>

              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-gray-400" />
                <span>Language: {language}</span>
              </div>

              {country && (
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-gray-400" />
                  <span>Country: {country}</span>
                </div>
              )}

              {Director && Director.length > 0 && (
                <div className="flex items-start gap-2">
                  <User className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <span className="text-gray-200 font-medium">
                      Director:{" "}
                    </span>
                    <span>{Director.join(", ")}</span>
                  </div>
                </div>
              )}
            </div>

            <p className="text-gray-300 mb-8 line-clamp-3 max-w-2xl text-xl">
              {description}
            </p>

            <div className="flex gap-4 mt-auto">
              <Button
                className="bg-pink-600 hover:bg-pink-700 text-white px-8 text-lg h-12"
                disabled={!session?.user.email}
                onClick={() => {
                  if (session?.user.email)
                    redirect(
                      `/customer/buyticket/${selectedCity.toLowerCase()}/${id}?view=slot`
                    );
                  else {
                    toast.warning("Please sign in to continue.");
                  }
                }}
              >
                Book tickets
              </Button>
              <Button
                variant="outline"
                className="border-white/20 bg-black/30 backdrop-blur-sm hover:bg-white/20 text-lg h-12"
              >
                <Share2 className="w-5 h-5 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* About section */}
      <div className="container mx-auto py-12 px-4 md:px-6">
        <Card className="p-0 overflow-hidden bg-white/5 backdrop-blur-sm border-none shadow-xl">
          <CardContent className="p-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">
              About the Movie
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-8 text-xl leading-relaxed">
              {description}
            </p>

            {/* Cast section */}
            {Actors && Actors.length > 0 && (
              <div className="mt-8">
                <h3 className="text-2xl font-bold mb-4 flex items-center">
                  <Film className="w-5 h-5 mr-2" />
                  Cast
                </h3>
                <div className="flex flex-wrap gap-4">
                  {Actors.map((actor, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2"
                    >
                      <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                        {actor.charAt(0)}
                      </div>
                      <span>{actor}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default MovieDetails;
