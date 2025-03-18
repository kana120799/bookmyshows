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

// export default function CinemaLayout({ children }: PropsWithChildren<{}>) {
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
    try {
      await axios.delete(`/api/admin/cinema/${cinemaId}`);
      fetchData();
    } catch (error) {
      console.error("Error fetching halls:", error);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      <div className="bg-white shadow-md p-4 flex justify-between items-center top-0 left-0 right-0 z-10">
        <h1 className="text-2xl font-semibold text-gray-800">Cinema List</h1>
        <button
          className="bg-[#F84464] text-white px-4 py-2 rounded-lg text-xl "
          onClick={() => router.push("/admin/cinema/create")}
        >
          Add New
        </button>
      </div>
      <div className=" bg-gray-50">
        <div className="pt-10 px-4 md:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 ">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xl font-medium text-gray-500 uppercase tracking-wider w-3/12">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xl font-medium text-gray-500 uppercase tracking-wider w-3/12">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xl font-medium text-gray-500 uppercase tracking-wider w-7/12">
                      Address
                    </th>
                    <th className="px-6 py-3 text-left text-xl font-medium text-gray-500 uppercase tracking-wider w-8/12"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cinemas?.map((item) => (
                    <tr
                      key={item.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/admin/cinema/${item.id}`);
                      }}
                      className="cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-900 flex flex-nowrap items-center">
                        <span
                          className="cursor-pointer hover:underline flex items-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(item.id);
                          }}
                          title="Click to copy"
                        >
                          {item.id}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="10"
                            height="10"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-copy ml-2"
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
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-900">
                        {item.name}
                      </td>
                      <td className="px-6 py-4 text-lg text-gray-900">
                        <div className="max-w-2xl break-words">
                          {item.address.street}, &nbsp;
                          {item.address.city},&nbsp;
                          {item.address.state}
                        </div>
                      </td>
                      <td
                        className="px-6 py-4 text-lg text-gray-900 cursor-pointer "
                        onClick={(e) => {
                          e.stopPropagation();
                          // deleteHall(cinemaIdValue, item.id);
                          deleteCinema(item.id);
                          setLoading(true);
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
