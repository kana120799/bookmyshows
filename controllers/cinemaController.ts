import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { addressType } from "@/types/cinemaType";
// import nodemailer from "nodemailer";

// import { Kafka } from "kafkajs";

// const kafka = new Kafka({
//   clientId: "nextjs-app",
//   brokers: ["192.168.29.249:9092"],
// });
// const producer = kafka.producer();

// Add Cinema
// export async function addCinema(data: {
//   name: string;
//   address: addressType;
//   halls: hallType; // Ensure this is the correct type
// }): Promise<NextResponse> {
//   const { name, address } = data;
//   if (!name || !address) {
//     return NextResponse.json(
//       { error: "Missing required fields" },
//       { status: 400 }
//     );
//   }

//   await prisma.cinema.create({
//     data: {
//       name: name,
//       address: {
//         create: {
//           street: address.street,
//           city: address.city,
//           state: address.state,
//           zipCode: address.zipCode,
//         },
//       },
//       halls: {
//         create: data.halls?.map((hall) => ({
//           name: hall.name,
//           totalSeats: Number(hall.totalSeats),
//         })),
//       },
//     },
//     include: {
//       address: true,
//       halls: true,
//     },
//   });
//   return NextResponse.json({ message: "cinema added" }, { status: 200 });
// }

type seatType = {
  id: string;
  type: "VIP" | "PREMIUM" | "REGULAR";
} | null;

type seatsLayoutType = {
  [row: string]: seatType[];
};

type hallType = {
  name: string;
  seats: {
    seats: seatsLayoutType;
    totalSeats: number;
  };
};
export async function addCinema(data: {
  name: string;
  address: addressType;
  halls: hallType[];
}): Promise<NextResponse> {
  const { name, address, halls } = data;

  if (!name || !address || !halls || halls.length === 0) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const cinema = await prisma.cinema.create({
    data: {
      name: name,
      address: {
        create: {
          street: address.street,
          city: address.city.toLowerCase(),
          state: address.state,
          zipCode: address.zipCode,
        },
      },
      halls: {
        create: halls?.map((hall) => ({
          name: hall.name,
          layout: hall.seats.seats,
          totalSeats: hall.seats.totalSeats,
        })),
      },
    },
    include: {
      address: true,
      halls: true,
    },
  });

  return NextResponse.json(
    { message: "cinema added", data: cinema },
    { status: 200 }
  );
}
export async function getCinema(): Promise<NextResponse> {
  const cinemas = await prisma.cinema.findMany({
    include: {
      address: true,
    },
  });

  return NextResponse.json({ data: cinemas }, { status: 200 });
}

export async function getCinemaHalls(cinemaId: string): Promise<NextResponse> {
  const cinemaExists = await prisma.cinema.findUnique({
    where: { id: cinemaId },
  });

  if (!cinemaExists) {
    throw new Error("Cinema not found");
  }

  const halls = await prisma.cinemaHall.findMany({
    where: {
      cinemaId: cinemaId,
    },
    include: {
      cinema: {
        select: {
          name: true,
        },
      },
    },
  });
  return NextResponse.json(halls, { status: 200 });
}

// Delete  hall by hall ID from a cinema
export async function deleteHallFromCinema(
  cinemaId: string,
  hallId: string
): Promise<NextResponse> {
  const cinemaExists = await prisma.cinema.findUnique({
    where: { id: cinemaId },
  });

  if (!cinemaExists) {
    throw new Error("Cinema not found");
  }

  // Verify hall exists to this cinema
  const hall = await prisma.cinemaHall.findFirst({
    where: {
      id: hallId,
      cinemaId: cinemaId,
    },
  });

  if (!hall) {
    throw new Error("Hall not found or doesn't belong to this cinema");
  }

  await prisma.cinemaHall.delete({
    where: {
      id: hallId,
    },
  });

  return NextResponse.json(
    { message: "Hall deleted successfully", data: cinemaId },
    { status: 200 }
  );
}

export async function deleteCinema(cinemaId: string): Promise<NextResponse> {
  const result = await prisma.$transaction(async (tx) => {
    const cinema = await tx.cinema.findUnique({
      where: { id: cinemaId },
      include: { halls: true },
    });
    if (!cinema) throw new Error("Cinema not found");

    const hallIds = cinema.halls?.map((hall) => hall.id);

    // Delete all ShowSeats related to Shows in these halls
    await tx.showSeat.deleteMany({
      where: {
        show: {
          cinemaHallId: { in: hallIds },
        },
      },
    });

    // Delete all Shows related to these cinema halls
    await tx.show.deleteMany({
      where: {
        cinemaHallId: { in: hallIds },
      },
    });

    await tx.cinemaHall.deleteMany({
      where: { cinemaId },
    });

    await tx.cinema.delete({
      where: { id: cinemaId },
    });

    if (cinema.addressId) {
      await tx.address.delete({
        where: { id: cinema.addressId },
      });
    }
    return { message: "Cinema deleted successfully" };
  });

  return NextResponse.json(result, { status: 200 });
}

export async function getCinemaById(cinemaId: string): Promise<NextResponse> {
  const cinema = await prisma.cinema.findUnique({ where: { id: cinemaId } });
  return NextResponse.json({ data: cinema }, { status: 200 });
}

// =========================================================================================================================================

export async function getCinemasByCityAndMovie(
  city: string,
  movieId: string,
  todayDate: string
): Promise<NextResponse> {
  try {
    // Set up date boundaries
    const today = new Date(todayDate);
    // Get shows for the movie regardless of date initially
    const shows = await prisma.show.findMany({
      where: {
        movieId: movieId,
        cinemaHall: {
          cinema: {
            address: {
              city: {
                equals: city,
                mode: "insensitive",
              },
            },
          },
        },
      },
      include: {
        movie: {
          select: {
            language: true,
            title: true,
            genre: true,
            durationMins: true,
          },
        },
        cinemaHall: {
          include: {
            cinema: {
              include: {
                address: true,
              },
            },
          },
        },
      },
    });

    if (!shows.length) {
      return NextResponse.json(
        { message: `No shows found for this movie in ${city}` },
        { status: 404 }
      );
    }

    // Filter shows that need date adjustment (not matching today's date)
    const showsToUpdate = shows.filter((show) => {
      const showDate = new Date(show.startTime);
      return (
        showDate.getDate() !== today.getDate() ||
        showDate.getMonth() !== today.getMonth() ||
        showDate.getFullYear() !== today.getFullYear()
      );
    });

    // Update shows and reset seats in a transaction
    if (showsToUpdate.length > 0) {
      await prisma.$transaction(
        showsToUpdate.flatMap((show) => {
          const showDate = new Date(show.startTime);
          // Keep the original time but set to today's date
          const newStartTime = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate(),
            showDate.getHours(),
            showDate.getMinutes(),
            showDate.getSeconds()
          );

          return [
            prisma.show.update({
              where: { id: show.id },
              data: { startTime: newStartTime },
            }),
            prisma.showSeat.updateMany({
              where: { showId: show.id },
              data: {
                isReserved: false,
                status: "AVAILABLE",
              },
            }),
          ];
        })
      );
    }

    // Process the data for response
    const hallsMap = new Map();
    const cinemasMap = new Map();

    shows.forEach((show) => {
      const hall = show.cinemaHall;
      const cinema = hall.cinema;

      hallsMap.set(hall.id, hall);
      cinemasMap.set(cinema.id, cinema);
    });

    const responseData = {
      cinemas: Array.from(cinemasMap.values()).map((cinema) => ({
        id: cinema.id,
        name: cinema.name,
        address: cinema.address,
      })),
      shows: shows.map((show) => ({
        id: show.id,
        movieId: show.movieId,
        cinemaHallId: show.cinemaHallId,
        startTime: show.startTime,
      })),
      halls: Array.from(hallsMap.values()).map((hall) => ({
        id: hall.id,
        name: hall.name,
        totalSeats: hall.totalSeats,
        cinemaId: hall.cinemaId,
      })),
      movie: shows[0].movie,
    };

    return NextResponse.json({ data: responseData }, { status: 200 });
  } catch (error) {
    console.error("Error fetching cinemas by city and movie:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
