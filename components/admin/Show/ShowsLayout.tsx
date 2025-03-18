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

export default function ShowLayout({ page }: { page: string }) {
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
          }) => {
            return {
              id: data.id,
              startTime: data.startTime,
              movieName: data.movie.title,
              cinemaHallName: data.cinemaHall.name,
            };
          }
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
    try {
      setLoading(true);
      const response = await axios.delete(`/api/admin/show/${showId}`);
      if (response.status === 200) {
        fetchData();
      }
    } catch (error) {
      console.error("Error fetching halls:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      <div className="bg-white shadow-md p-4 flex justify-between items-center top-0 left-0 right-0 z-10">
        <h1 className="text-2xl font-semibold text-gray-800">Show List</h1>
        <button
          className="bg-[#F84464] text-white text-xl px-4 py-2 rounded-lg "
          onClick={() => router.push("/admin/show/create")}
        >
          Add New
        </button>
      </div>
      <div className="min-h-screen ">
        <div className="pt-20 px-4 md:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xl font-medium text-gray-500 uppercase tracking-wider w-1/12">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xl font-medium text-gray-500 uppercase tracking-wider w-3/12">
                      Movie_Name
                    </th>
                    <th className="px-6 py-3 text-left text-xl font-medium text-gray-500 uppercase tracking-wider w-6/12">
                      CINEMA_HALL
                    </th>

                    <th className="px-6 py-3 text-left text-xl font-medium text-gray-500 uppercase tracking-wider w-8/12">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xl font-medium text-gray-500 uppercase tracking-wider w-8/12">
                      Time
                    </th>
                    <th></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {shows?.map((item) => (
                    <tr
                      key={item.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (page === "show")
                          router.push(`/admin/show/${item.id}`);
                        else if (page === "booking")
                          router.push(`/admin/booking/${item.id}`);
                      }}
                      className="cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-900">
                        {item.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-900">
                        {item.movieName}
                      </td>
                      <td className="px-6 py-4 text-gray-900 text-lg">
                        <div className="max-w-2xl break-words">
                          {item.cinemaHallName}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-900">
                        {new Date(item.startTime).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-900">
                        {new Date(item.startTime).toLocaleTimeString()}
                      </td>
                      {page === "show" && (
                        <td
                          className="px-6 py-4  text-gray-900 cursor-pointer "
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteShow(item.id);
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-trash  "
                          >
                            <path d="M3 6h18" />
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                          </svg>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
