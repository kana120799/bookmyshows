import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function setShow({
  movieId,
  cinemaHallId,
  startTime,
}: {
  movieId: string;
  cinemaHallId: string;
  startTime: Date;
}) {
  if (!movieId || !cinemaHallId || !startTime) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  // show with the same movieId, Date and cinemaHallId already exists
  const existingShow = await prisma.show.findFirst({
    where: {
      movieId: movieId,
      cinemaHallId: cinemaHallId,
      startTime: startTime,
    },
  });

  if (existingShow) {
    return NextResponse.json(
      { error: "A show with this movie already exists in this cinema hall" },
      { status: 409 }
    );
  }

  const newShow = await prisma.show.create({
    data: {
      movieId: movieId,
      cinemaHallId: cinemaHallId,
      startTime: startTime,
    },
  });
  return NextResponse.json(newShow, { status: 200 });
}

// get show

export async function getShow() {
  const show = await prisma.show.findMany({
    include: {
      movie: true,
      cinemaHall: true,
    },
  });
  return NextResponse.json({ data: show }, { status: 200 });
}

// delete show
export async function deleteShow(showId: string) {
  const result = await prisma.$transaction(async (tx) => {
    const show = await tx.show.findUnique({
      where: { id: showId },
      include: { seats: true },
    });
    if (!show) throw new Error("Show not found");

    // Delete all ShowSeats
    await tx.showSeat.deleteMany({
      where: {
        showId: showId,
      },
    });

    // Delete  Bookings
    await tx.booking.deleteMany({
      where: {
        showId: showId,
      },
    });

    // Delete BookingSeats
    await tx.bookingSeat.deleteMany({
      where: {
        showSeat: {
          showId: showId,
        },
      },
    });

    // Delete the Show
    await tx.show.delete({
      where: { id: showId },
    });

    return { message: "Show and all related seats deleted successfully" };
  });

  return NextResponse.json({ data: result }, { status: 200 });
}
