import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Seat = {
  id: string;
  type: "VIP" | "PREMIUM" | "REGULAR";
};

type SeatLayout = {
  [key: string]: (Seat | null)[];
};

type ShowSeat = {
  showId: string;
  row: string;
  column: string;
  type: "VIP" | "PREMIUM" | "REGULAR";
  price: number;
  isReserved: boolean;
  status: "AVAILABLE" | "RESERVED" | "BOOKED";
};

export async function initializeShowSeats({
  id,
  vipPrice,
  premiumPrice,
  regularPrice,
}: {
  id: string;
  vipPrice: number;
  premiumPrice: number;
  regularPrice: number;
}) {
  // Check seats already exist for this showId
  const existingSeatsCount = await prisma.showSeat.count({
    where: { showId: id },
  });

  if (existingSeatsCount > 0) {
    return NextResponse.json(
      { message: "Ticket prices already initialized" },
      { status: 200 }
    );
  }

  const show = await prisma.show.findUnique({
    where: { id },
    include: {
      cinemaHall: true,
    },
  });

  if (!show) {
    return NextResponse.json({ error: "Show not found" }, { status: 404 });
  }

  const layout = show.cinemaHall.layout as SeatLayout;

  //  show seats based on  layout
  const showSeats: ShowSeat[] = Object.entries(layout).flatMap(
    ([row, seats]: [string, (Seat | null)[]]) =>
      seats
        .filter((seat): seat is Seat => seat !== null)
        ?.map((seat) => {
          const price =
            seat.type === "VIP"
              ? vipPrice
              : seat.type === "PREMIUM"
              ? premiumPrice
              : regularPrice;

          return {
            showId: id,
            row,
            column: seat.id,
            type: seat.type,
            price,
            isReserved: false,
            status: "AVAILABLE" as const,
          };
        })
  );

  // Create  show seats
  await prisma.showSeat.createMany({
    data: showSeats,
  });

  return NextResponse.json(
    { message: " Ticket prices submitted successfully!" },
    { status: 200 }
  );
}

export async function getShowSeats(id: string) {
  const seats = await prisma.showSeat.findMany({
    where: { showId: id },
    include: { show: true },
  });

  return NextResponse.json({ data: seats }, { status: 200 });
}
