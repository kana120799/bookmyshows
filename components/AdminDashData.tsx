"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Loader from "./Loader";

type DashboardProps = {
  seatUtilization: {
    name: string;
    occupied: number;
    totalSeats: number;
    utilization: number;
  }[];
  totalUsers: number;
  totalBookings: number;
  totalRevenue: number;
  totalCinemas: number;
};

interface AdminDashDataProps {
  data: DashboardProps | null;
}

export default function AdminDashData({ data }: AdminDashDataProps) {
  if (!data) {
    return <Loader />;
  }
  // Aggregate Data
  const totalUsers = data.totalUsers;
  const totalBookings = data.totalBookings;
  const totalRevenue = data.totalRevenue;
  const totalCinemas = data.totalCinemas;

  // Seat Utilization (Bar Chart)
  const seatUtilization = data.seatUtilization;

  return (
    <div className="container mx-auto p-4 mt-12">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold">Total Users</h2>
          <p className="text-2xl">{totalUsers}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold">Total Bookings</h2>
          <p className="text-2xl">{totalBookings}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold">Total Revenue</h2>
          <p className="text-2xl">${totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold">Total Cinemas</h2>
          <p className="text-2xl">{totalCinemas}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 mt-20 md:grid-cols-1 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow ">
          <h2 className="text-xl font-semibold mb-2">Seat Utilization</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={seatUtilization}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="occupied" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
