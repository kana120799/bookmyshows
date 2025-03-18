"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Loader from "@/components/Loader";

// Cinema Item Interface
interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  createdAt: Date;
}

export default function UserLayout() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/api/users");
        const filterData = response.data.data?.map((data: UserItem) => {
          return {
            id: data.id,
            name: data.name,
            email: data.email,
            role: data.role,
            phone: data.phone,
            createdAt: data.createdAt,
          };
        });
        console.log("users data:", response.data.data, filterData);
        setUsers(filterData || []);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      <div className="bg-white shadow-md p-4 flex justify-between items-center top-0 left-0 right-0 z-10">
        <h1 className="text-2xl font-semibold text-gray-800">User List</h1>
        {/* <button
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition duration-200"
          // onClick={() => redirect("/admin/movie/create")}
        >
          Add New
        </button> */}
      </div>
      <div className="min-h-screen bg-gray-100">
        {/* Top Bar */}

        {/* Table Section */}
        <div className="pt-20 px-4 md:px-6 lg:px-8">
          {" "}
          {/* Padding-top to account for fixed top bar */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xl font-medium text-gray-500 uppercase tracking-wider w-1/12">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xl font-medium text-gray-500 uppercase tracking-wider w-3/12">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xl font-medium text-gray-500 uppercase tracking-wider w-4/12">
                      EMAIL
                    </th>
                    <th className="px-6 py-3 text-left text-xl font-medium text-gray-500 uppercase tracking-wider w-2/12">
                      PHONE
                    </th>
                    <th className="px-6 py-3 text-left text-xl font-medium text-gray-500 uppercase tracking-wider w-2/12">
                      ROLE
                    </th>
                    <th className="px-6 py-3 text-left text-xl font-medium text-gray-500 uppercase tracking-wider w-2/12">
                      CREATEDAT
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users?.map((data) => (
                    <tr
                      key={data.id}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-900">
                        <span
                          className="cursor-pointer hover:underline"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(data.id);
                          }}
                          title="Click to copy"
                        >
                          {data.id}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-900">
                        {data.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-900">
                        {data.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-900">
                        {data.phone == null ? <span>--</span> : data.phone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-900">
                        {data.role}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-900">
                        {new Date(data.createdAt).toLocaleDateString()}
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
