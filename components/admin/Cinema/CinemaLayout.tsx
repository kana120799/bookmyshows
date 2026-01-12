"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Loader from "@/components/Loader";

interface CinemaItem {
  id: string;
  name: string;
  address: {
    id: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

export default function CinemaLayout() {
  const router = useRouter();
  const [cinemas, setCinemas] = useState<CinemaItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchData = async () => {
    try {
      const response = await axios.get("/api/admin/cinema");
      setCinemas(response.data.data || []);
    } catch (error) {
      console.error("Error fetching cinemas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const deleteCinema = async (cinemaId: string) => {
    if (confirm("Are you sure you want to delete this cinema?")) {
      try {
        await axios.delete(`/api/admin/cinema/${cinemaId}`);
        fetchData();
      } catch (error) {
        console.error("Error deleting cinema:", error);
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
          <h1 className="text-2xl font-bold text-gray-800">
            Cinema Management
          </h1>
          <button
            className="bg-[#F84464] hover:bg-[#e63956] text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
            onClick={() => {
              setLoading(true);
              router.push("/admin/cinema/create");
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
            Add New Cinema
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
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-lg font-semibold text-gray-600 uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-6 py-3 text-right text-lg font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {cinemas?.map((item) => (
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
                          router.push(`/admin/cinema/${item.id}`);
                        }}
                        className="text-lg text-gray-900 hover:text-[#F84464] font-medium"
                      >
                        {item.name}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-lg text-gray-600 max-w-md">
                        {item.address.street}, {item.address.city},{" "}
                        {item.address.state}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteCinema(item.id);
                        }}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        title="Delete cinema"
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
          {cinemas.length === 0 && (
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
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">
                No cinemas
              </h3>
              <p className="mt-1 text-lg text-gray-500">
                Get started by adding a new cinema.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
