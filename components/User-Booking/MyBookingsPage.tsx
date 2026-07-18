"use client";

import { useEffect, useState } from "react";
import { MyBookingTable } from "./MyBookingTable";
import axios from "axios";
import { useSession } from "next-auth/react";
import Loader from "../Loader";

export default function BookingsPage() {
  const [bookings, setBookings] = useState<[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const { data: session } = useSession();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const userBookings = await axios.get(
          `/api/users?userId=${session?.user.id}`
        );
        setBookings(userBookings.data.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      }
    };
    fetchBookings();
  }, [session?.user.id]);

  if (loading) return <Loader />;
  return <MyBookingTable bookings={bookings} />;
}
