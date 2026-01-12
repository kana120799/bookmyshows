"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Loader from "@/components/Loader";

interface HallItem {
  id: string;
  name: string;
  totalSeats: number;
  cinemaId: string;
  cinema: {
    name: string;
  };
}

export default function HallLayout() {
  const { id }: { id: string } = useParams();
  const router = useRouter();
  const [halls, setHalls] = useState<HallItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const getHallDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/admin/hall/${id}`);
      const fetchedHalls = response.data || [];
      setHalls(fetchedHalls);
    } catch (error) {
      console.error("Error fetching halls:", error);
      setHalls([]);
      router.push("/admin/cinema");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getHallDetails();
  }, []);

  // const deleteHall = async (cinemaId: string, hallId: string) => {
  //   try {
  //     const response = await axios.delete(
  //       `/api/admin/hall/?cinemaId=${cinemaId}&hallId=${hallId}`
  //     );
  //     fetchData();
  //     console.log("sdnfdsifhsdfsd", response.data.data);
  //     getHallDetails(response.data.data);
  //   } catch (error) {
  //     console.error("Error fetching halls:", error);
  //   }
  // };

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      <div className="bg-white shadow-md p-4 flex justify-between items-center top-0 left-0 right-0 z-10 ">
        <h1 className="text-2xl font-semibold text-gray-800">Hall List</h1>
        <div>
          <button
            className="bg-[#6767dd] text-white px-4 py-2 rounded-lg text-xl mr-5 "
            onClick={() => router.push("/admin/cinema")}
          >
            Back
          </button>
          <button
            className="bg-[#F84464] text-white px-4 py-2 rounded-lg text-xl "
            onClick={() => router.push("/admin/cinema/create")}
          >
            Add New
          </button>
        </div>
      </div>
      <div className="min-h-screen bg-gray-100">
        <div className="pt-20 px-4 md:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xl font-medium text-gray-500 uppercase tracking-wider w-1/12">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xl font-medium text-gray-500 uppercase tracking-wider w-3/12">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xl font-medium text-gray-500 uppercase tracking-wider w-3/12">
                      TotalSeats
                    </th>
                    <th className="px-6 py-3 text-left text-xl font-medium text-gray-500 uppercase tracking-wider w-5/12">
                      Cinema_Name
                    </th>
                    <th></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {halls?.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-900">
                        {item.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-900">
                        {item.name}
                      </td>
                      <td className="px-6 py-4 text-lg text-gray-900">
                        {item.totalSeats}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-900">
                        {item.cinema.name}
                      </td>
                      {/* <td
                      className="px-6 py-4 text-lg text-gray-900 cursor-pointer "
                      onClick={() => {
                        deleteHall(cinemaIdValue, item.id);
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
                    </td> */}
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
