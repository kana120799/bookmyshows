"use client";

import React, { useState, useEffect } from "react";
import { Heart, Info, Calendar, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import Loader from "./Loader";
import { useParams, useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { useSelector } from "react-redux";
import { RootState } from "@/GlobalState/store";

interface DaySchedule {
  day: string;
  date: number;
  month: string;
  fullDate: Date;
  isActive?: boolean;
}

interface Showtime {
  time: string;
  isAvailable: boolean;
}

interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

interface Cinema {
  id: string;
  name: string;
  address: Address;
  showtimes?: Showtime[];
  hasSubtitles?: boolean;
}

interface Movie {
  language: string;
  title: string;
  genre: string[];
  durationMins: number;
}

interface MovieShowtimesProps {
  setShowId: (id: string) => void;
}

type ShowsType = {
  cinemaHallId: string;
  id: string;
  movieId: string;
  startTime: string;
};

// Move this function outside the component or declare it before usage
const generateDateSchedule = (): DaySchedule[] => {
  const today = new Date();
  const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const months = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];

  // return Array.from({ length: 7 }, (_, i) => {
  //   const date = new Date();
  //   date.setDate(today.getDate() + i);

  //   return {
  //     day: days[date.getDay()],
  //     date: date.getDate(),
  //     month: months[date.getMonth()],
  //     fullDate: new Date(date),
  //     isActive: i === 0,
  //   };
  // });
  return [
    {
      day: days[today.getDay()],
      date: today.getDate(),
      month: months[today.getMonth()],
      fullDate: new Date(today),
      isActive: true,
    },
  ];
};

export default function CinemasByCity({ setShowId }: MovieShowtimesProps) {
  const router = useRouter();
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [movie, setMovie] = useState<Movie | null>(null);
  const [shows, setShows] = useState<ShowsType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { selectedCity } = useSelector((state: RootState) => state.city);

  // const [schedule, setSchedule] = useState<DaySchedule[]>(
  //   generateDateSchedule()
  // );
  const [schedule] = useState<DaySchedule[]>(generateDateSchedule());
  const [favorites, setFavorites] = useState<{ [key: string]: boolean }>({});

  const params = useParams();
  const city = params.city as string;
  const id = params.id as string;

  useEffect(() => {
    async function fetchCinemas() {
      try {
        const response = await fetch(
          `/api/admin/cinema/city/?city=${encodeURIComponent(
            city
          )}&movieId=${encodeURIComponent(id)}&date=${encodeURIComponent(
            schedule[0].fullDate.toISOString()
          )}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            cache: "no-store",
          }
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status}`);
        }

        const responseData = await response.json();
        setMovie(responseData.data.movie);
        setCinemas(responseData.data.cinemas);
        setShows(responseData.data.shows);
      } catch (err) {
        setError("There are no reservations for this movie or this location.");
        console.log("Error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchCinemas();
  }, []);

  // const selectDate = (selectedDate: Date) => {
  //   setSchedule(
  //     schedule?.map((day) => ({
  //       ...day,
  //       isActive:
  //         day.fullDate.getDate() === selectedDate.getDate() &&
  //         day.fullDate.getMonth() === selectedDate.getMonth() &&
  //         day.fullDate.getFullYear() === selectedDate.getFullYear(),
  //     }))
  //   );
  // };

  const toggleFavorite = (cinemaName: string) => {
    setFavorites((prev) => ({
      ...prev,
      [cinemaName]: !prev[cinemaName],
    }));
  };

  // Early returns must come after all hooks
  if (loading) return <Loader />;
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-10 ">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-md text-xl">
          {error}
        </div>
        <Button
          className="bg-red-600 hover:bg-red-700 text-white px-8 text-xl"
          onClick={() => {
            router.push(`/customer/home/${selectedCity.toLowerCase()}`);
          }}
        >
          Back
        </Button>
      </div>
    );
  if (!movie) return null;

  return (
    <div className="max-w-4xl mx-auto rounded-lg shadow-sm overflow-hidden mt-16  bg-gray-50 border-b border-gray-200 ">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800">
          {movie.title} - ({movie.language})
        </h1>
        <div className="flex flex-wrap gap-2 mt-2">
          {movie.genre?.map((genre, index) => (
            <span
              key={index}
              className="px-3 py-1 text-lg border border-gray-300 rounded-full"
            >
              {genre}
            </span>
          ))}
        </div>
      </div>

      {/* // 7 days selection  */}
      {/* <div className="flex overflow-x-auto border-b border-gray-100">
        {schedule?.map((day) => (
          <button
            key={day.date + day.month}
            onClick={() => {
            
              // selectDate(day.fullDate);
            }}
            className={cn(
              "flex-shrink-0 flex flex-col items-center justify-center py-3 px-6 transition-colors",
              day.isActive
                ? "bg-red-500 text-white"
                : "hover:bg-gray-100 text-gray-800"
            )}
          >
            <span className="text-lg font-medium">{day.day}</span>
            <span
              className={cn(
                "text-2xl font-bold",
                day.isActive ? "text-white" : "text-gray-800"
              )}
            >
              {day.date}
            </span>
            <span className="text-xs">{day.month}</span>
          </button>
        ))}
      </div> */}

      <div className="flex border-b border-gray-200">
        <div className="flex-shrink-0 flex flex-col items-center justify-center py-3 px-6 bg-red-500 text-white">
          <span className="text-lg font-medium">{schedule[0].day}</span>
          <span className="text-2xl font-bold">{schedule[0].date}</span>
          <span className="text-xs">{schedule[0].month}</span>
        </div>
      </div>

      <div className="p-4 mt-10 ">
        {cinemas?.map((cinema) => (
          <div key={cinema.id} className="mb-6">
            <div className="flex items-start justify-between  ">
              <div className="flex items-start gap-2">
                <button
                  onClick={() => toggleFavorite(cinema.name)}
                  className="mt-1 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Heart
                    className={cn(
                      "h-6 w-6",
                      favorites[cinema.name] && "fill-red-500 text-red-500"
                    )}
                  />
                </button>
                <div>
                  <h3 className="font-semibold text-gray-800 text-xl">
                    {cinema.name}
                  </h3>
                  <p className=" text-gray-600 text-lg">
                    {cinema.address.street}, {cinema.address.city},
                    {cinema.address.state} {cinema.address.zipCode}
                  </p>
                </div>
              </div>
              <button className="flex items-center text-gray-500 hover:text-gray-700">
                <Info className="h-5 w-5" />
                <span className="ml-1 text-lg">INFO</span>
              </button>
            </div>

            <div className="flex gap-4 mt-4">
              <div className="flex items-center text-teal-500">
                <div className="border border-teal-500 rounded p-1 mr-2">
                  <Clock className="h-4 w-4" />
                </div>
                <span className="text-lg">M-Ticket</span>
              </div>
              <div className="flex items-center text-orange-500">
                <div className="border border-orange-500 rounded p-1 mr-2">
                  <Calendar className="h-4 w-4" />
                </div>
                <span className="text-lg">Food & Beverage</span>
              </div>
            </div>

            <div className="mt-4">
              <div className="text-lg text-gray-500 mb-2">
                Cancellation available
              </div>
              <div className="flex flex-wrap gap-3">
                {shows?.map((item) => {
                  // const currentTime = new Date();
                  // const showStartTime = new Date(item.startTime);
                  // const movieDurationMs = movie.durationMins * 60 * 1000;
                  // const movieEndTime = new Date(
                  //   showStartTime.getTime() + movieDurationMs
                  // );
                  // const bufferTimeMs = 30 * 60 * 1000;
                  // const bufferPoint = new Date(
                  //   movieEndTime.getTime() - bufferTimeMs
                  // );

                  // const isShowAvailable = currentTime < bufferPoint;

                  // console.log({
                  //   currentTime: currentTime.toLocaleTimeString(),
                  //   showStartTime: showStartTime.toLocaleTimeString(),
                  //   movieEndTime: movieEndTime.toLocaleTimeString(),
                  //   bufferPoint: bufferPoint.toLocaleTimeString(),
                  //   isShowAvailable,
                  // });

                  return (
                    <button
                      key={item.id}
                      onClick={() => setShowId(item.id)}
                      // disabled={!isShowAvailable}
                      className={cn(
                        "px-4 py-2 border rounded transition-colors",
                        "text-green-600 border-green-600 hover:bg-green-50"
                        // isShowAvailable
                        //   ? "text-green-600 border-green-600 hover:bg-green-50"
                        //   : "text-gray-600 border-gray-700 cursor-not-allowed opacity-50"
                      )}
                    >
                      {new Date(item.startTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
