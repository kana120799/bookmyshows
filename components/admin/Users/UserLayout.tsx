"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Loader from "@/components/Loader";

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  createdAt: Date;
}

export default function UserLayout() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`/api/users`);
        const filterData = response.data.data?.map((data: UserItem) => ({
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role,
          phone: data.phone,
          createdAt: new Date(data.createdAt),
        }));
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
    <div className="min-h-screen bg-gray-50 mt-12">
      {/* Header */}
      <header className="bg-white shadow-md p-6 sticky top-0 z-10">
        <div className=" mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
          {/* Uncomment and adjust when implementing add functionality */}
          {/* <button
            className="bg-[#F84464] hover:bg-[#e63956] text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
            onClick={() => redirect("/admin/users/create")}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New User
          </button> */}
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
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-lg font-semibold text-gray-600 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-lg font-semibold text-gray-600 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-lg font-semibold text-gray-600 uppercase tracking-wider">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users?.map((data) => (
                  <tr
                    key={data.id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(data.id);
                        }}
                        className="text-lg text-gray-600 hover:text-gray-900 flex items-center gap-2 group"
                        title="Click to copy"
                      >
                        {data.id.slice(0, 8)}...
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
                      <div className="text-lg text-gray-900 font-medium">
                        {data.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-lg text-gray-600 max-w-xs truncate">
                        {data.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-lg text-gray-600">
                        {data.phone || "—"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          data.role === "ADMIN"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {data.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-lg text-gray-600">
                        {new Date(data.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {users.length === 0 && (
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
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">
                No users
              </h3>
              <p className="mt-1 text-lg text-gray-500">
                No users found in the system.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// "use client";
// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import Loader from "@/components/Loader";

// // Cinema Item Interface
// interface UserItem {
//   id: string;
//   name: string;
//   email: string;
//   role: string;
//   phone: string;
//   createdAt: Date;
// }

// export default function UserLayout() {
//   const [users, setUsers] = useState<UserItem[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const response = await axios.get("/api/users");
//         const filterData = response.data.data?.map((data: UserItem) => {
//           return {
//             id: data.id,
//             name: data.name,
//             email: data.email,
//             role: data.role,
//             phone: data.phone,
//             createdAt: data.createdAt,
//           };
//         });
//         console.log("users data:", response.data.data, filterData);
//         setUsers(filterData || []);
//       } catch (error) {
//         console.error("Error fetching users:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   if (loading) {
//     return <Loader />;
//   }

//   return (
//     <>
//       <div className="bg-white shadow-md p-4 flex justify-between items-center top-0 left-0 right-0 z-10">
//         <h1 className="text-2xl font-semibold text-gray-800">User List</h1>
//         {/* <button
//           className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition duration-200"
//           // onClick={() => redirect("/admin/movie/create")}
//         >
//           Add New
//         </button> */}
//       </div>
//       <div className="min-h-screen bg-gray-100">
//         {/* Top Bar */}

//         {/* Table Section */}
//         <div className="pt-20 px-4 md:px-6 lg:px-8">
//           {" "}
//           {/* Padding-top to account for fixed top bar */}
//           <div className="bg-white rounded-lg shadow-md overflow-hidden">
//             <div className="overflow-x-auto">
//               <table className="min-w-full divide-y divide-gray-200">
//                 <thead className="bg-gray-100">
//                   <tr>
//                     <th className="px-6 py-3 text-left text-xl font-medium text-gray-500 uppercase tracking-wider w-1/12">
//                       ID
//                     </th>
//                     <th className="px-6 py-3 text-left text-xl font-medium text-gray-500 uppercase tracking-wider w-3/12">
//                       Name
//                     </th>
//                     <th className="px-6 py-3 text-left text-xl font-medium text-gray-500 uppercase tracking-wider w-4/12">
//                       EMAIL
//                     </th>
//                     <th className="px-6 py-3 text-left text-xl font-medium text-gray-500 uppercase tracking-wider w-2/12">
//                       PHONE
//                     </th>
//                     <th className="px-6 py-3 text-left text-xl font-medium text-gray-500 uppercase tracking-wider w-2/12">
//                       ROLE
//                     </th>
//                     <th className="px-6 py-3 text-left text-xl font-medium text-gray-500 uppercase tracking-wider w-2/12">
//                       CREATEDAT
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {users?.map((data) => (
//                     <tr
//                       key={data.id}
//                       onClick={(e) => {
//                         e.stopPropagation();
//                       }}
//                     >
//                       <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-900">
//                         <span
//                           className="cursor-pointer hover:underline"
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             navigator.clipboard.writeText(data.id);
//                           }}
//                           title="Click to copy"
//                         >
//                           {data.id}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-900">
//                         {data.name}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-900">
//                         {data.email}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-900">
//                         {data.phone == null ? <span>--</span> : data.phone}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-900">
//                         {data.role}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-900">
//                         {new Date(data.createdAt).toLocaleDateString()}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }
