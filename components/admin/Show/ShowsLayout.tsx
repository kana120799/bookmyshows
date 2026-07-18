"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Loader from "@/components/Loader";

interface CinemaItem {
  id: string;
  startTime: string;
  movieName: string;
  cinemaHallName: string;
}

export default function ShowLayout() {
  const router = useRouter();
  const [shows, setShows] = useState<CinemaItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchData = async () => {
    try {
      const response = await axios.get("/api/admin/show");
      if (response.status === 200) {
        const movidata = response.data.data?.map(
          (data: {
            id: string | number;
            startTime: string;
            movie: { title: string };
            cinemaHall: { name: string };
          }) => ({
            id: data.id.toString(),
            startTime: data.startTime,
            movieName: data.movie.title,
            cinemaHallName: data.cinemaHall.name,
          })
        );
        setShows(movidata || []);
      }
    } catch (error) {
      console.error("Error fetching shows:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const deleteShow = async (showId: string) => {
    if (confirm("Are you sure you want to delete this show?")) {
      try {
        setLoading(true);
        const response = await axios.delete(`/api/admin/show/${showId}`);
        if (response.status === 200) {
          fetchData();
        }
      } catch (error) {
        console.error("Error deleting show:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gray-50 mt-12">
      {/* Header */}
      <header className="bg-white shadow-md p-6 sticky top-0 z-10">
        <div className=" mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Show Management</h1>
          <button
            className="bg-[#F84464] hover:bg-[#e63956] text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
            onClick={() => {
              setLoading(true);
              router.push("/admin/show/create");
            }}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add New Show
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className=" mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-lg font-semibold text-gray-600 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-lg font-semibold text-gray-600 uppercase tracking-wider">
                    Movie
                  </th>
                  <th className="px-6 py-3 text-left text-lg font-semibold text-gray-600 uppercase tracking-wider">
                    Cinema Hall
                  </th>
                  <th className="px-6 py-3 text-left text-lg font-semibold text-gray-600 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-lg font-semibold text-gray-600 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-right text-lg font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {shows?.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(item.id);
                        }}
                        className="text-lg text-gray-600 hover:text-gray-900 flex items-center gap-2 group"
                        title="Click to copy"
                      >
                        {item.id.slice(0, 8)}...
                        <svg
                          className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <rect
                            width="14"
                            height="14"
                            x="8"
                            y="8"
                            rx="2"
                            ry="2"
                          />
                          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                        </svg>
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => {
                          setLoading(true);

                          router.push(`/admin/show/${item.id}`);
                        }}
                        className="text-lg text-gray-900 hover:text-[#F84464] font-medium"
                      >
                        {item.movieName}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-lg text-gray-600 max-w-md">
                        {item.cinemaHallName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-lg text-gray-600">
                        {new Date(item.startTime).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-lg text-gray-600">
                        {new Date(item.startTime).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteShow(item.id);
                        }}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        title="Delete show"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4M3 7h18"
                          />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {shows.length === 0 && (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 4v16M17 4v16M4 8h16M4 12h16M4 16h16"
                />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">
                No shows
              </h3>
              <p className="mt-1 text-lg text-gray-500">
                Get started by adding a new show.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
