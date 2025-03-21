// import AdminDashboard from "./AdminDashboard";

// import {
//   fakeUsers,
//   fakeBookings,
//   fakePayments,
//   fakeShows,
//   fakeMovies,
//   fakeCinemaHalls,
//   fakeCinemas,
// } from "@/static-data/admin-fake";
// export default function AdminPage() {
//   return (
//     <AdminDashboard
//       users={fakeUsers}
//       bookings={fakeBookings}
//       payments={fakePayments}
//       shows={fakeShows}
//       movies={fakeMovies}
//       cinemaHalls={fakeCinemaHalls}
//       cinemas={fakeCinemas}
//     />
//   );
// }

"use client";

import React, { useEffect, useState } from "react";
import AdminDashData from "./AdminDashData";
import axios from "axios";
import AdminDashboard from "./AdminDashboard";
import Loader from "./Loader";

function AdminPage() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        const response = await axios.get("/api/admin/dashboard");
        setDashboardData(response.data.data);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) return <Loader />;

  return (
    <>
      <AdminDashboard>
        <AdminDashData data={dashboardData} />
      </AdminDashboard>
    </>
  );
}

export default AdminPage;
