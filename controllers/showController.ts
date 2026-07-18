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
  try {
    const result = await prisma.$transaction(
      async (tx) => {
        const show = await tx.show.findUnique({
          where: { id: showId },
          include: {
            seats: { select: { id: true } }, // Only fetch seat IDs
            bookings: {
              select: { id: true, payment: true, ticket: true },
            },
          },
        });

        if (!show) {
          throw new Error("Show not found");
        }

        //  Delete MailTicket records
        await tx.mailTicket.deleteMany({
          where: {
            bookingId: { in: show.bookings.map((b) => b.id) },
          },
        });

        await tx.payment.deleteMany({
          where: {
            bookingId: { in: show.bookings.map((b) => b.id) },
          },
        });

        await tx.bookingSeat.deleteMany({
          where: {
            showSeatId: { in: show.seats.map((s) => s.id) },
          },
        });

        await tx.booking.deleteMany({
          where: { showId: showId },
        });

        await tx.showSeat.deleteMany({
          where: { showId: showId },
        });

        await tx.show.delete({
          where: { id: showId },
        });

        return { message: "Show and all related records deleted successfully" };
      },
      {
        maxWait: 10000, // Wait up to 10 seconds for the transaction to start
        timeout: 15000, // Allow up to 15 seconds for the transaction to complete
      }
    );

    console.log("Transaction result:", result);
    return NextResponse.json({ data: result }, { status: 200 });
  } catch (error) {
    console.error("Error deleting show:", error);

    return NextResponse.json(
      { error: "Failed to delete show" },
      { status: 500 }
    );
  }
}
