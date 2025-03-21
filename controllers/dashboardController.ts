import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

interface SeatUtilization {
  name: string;
  totalSeats: number;
  occupied: number;
  utilization: number;
}

// interface TotalsResponse {
//   totalUsers: number;
//   totalBookings: number;
//   totalRevenue: number;
//   totalCinemas: number;
//   seatUtilization: SeatUtilization[];
// }

export async function getTotals(): Promise<NextResponse> {
  const [
    totalUsers,
    totalBookings,
    totalRevenueResult,
    totalCinemas,
    cinemaHalls,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.booking.count(),
    prisma.payment.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        status: "COMPLETED",
      },
    }),
    prisma.cinema.count(),
    //  all cinema halls with shows and bookings
    prisma.cinemaHall.findMany({
      include: {
        shows: {
          include: {
            seats: {
              where: {
                isReserved: true,
              },
            },
          },
        },
      },
    }),
  ]);

  const totalRevenue = totalRevenueResult._sum.amount || 0;

  //  seat utilization for each hall
  const seatUtilization: SeatUtilization[] = cinemaHalls.map((hall) => {
    const totalSeats = hall.totalSeats;

    // occupied seats  all shows in hall
    const occupied = hall.shows.reduce((sum, show) => {
      return sum + show.seats.length;
    }, 0);
    const utilization = totalSeats > 0 ? (occupied / totalSeats) * 100 : 0;

    return {
      name: hall.name,
      totalSeats,
      occupied,
      utilization: Number(utilization.toFixed(2)),
    };
  });

  return NextResponse.json(
    {
      data: {
        totalUsers,
        totalBookings,
        totalRevenue,
        totalCinemas,
        seatUtilization,
      },
    },
    { status: 200 }
  );
}
// throw new Error("Failed to fetch totals");
