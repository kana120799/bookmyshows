import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { addressType } from "@/types/cinemaType";

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
          city: address.city,
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

// export async function getCinemasByCity(city: string): Promise<NextResponse> {
//   const cinemas = await prisma.cinema.findMany({
//     where: {
//       address: {
//         city: {
//           equals: city,
//           mode: "insensitive", // Case-insensitive search
//         },
//       },
//     },
//     include: {
//       address: true,
//       halls: true,
//     },
//   });

//   if (!cinemas.length) {
//     return NextResponse.json(
//       { message: `No cinemas found in ${city}` },
//       { status: 404 }
//     );
//   }

//   return NextResponse.json({ data: cinemas }, { status: 200 });
// }

// export async function getCinemasByCityAndMovie(
//   city: string,
//   movieId: string,
// ): Promise<NextResponse> {
//   try {
//     const shows = await prisma.show.findMany({
//       where: {
//         movieId: movieId,
//       },
//       include: {
//         movie: {
//           select: {
//             language: true,
//             title: true,
//             genre: true,
//             durationMins: true,
//           },
//         },
//         cinemaHall: {
//           include: {
//             cinema: {
//               include: {
//                 address: {
//                   where: {
//                     city: {
//                       equals: city,
//                       mode: "insensitive",
//                     },
//                   },
//                 },
//               },
//             },
//           },
//         },
//       },
//     });

//     // If no shows found, return early
//     if (!shows.length) {
//       return NextResponse.json(
//         { message: `No shows found for this movie in ${city}` },
//         { status: 404 }
//       );
//     }

//     // Extract unique cinema halls from shows
//     const halls = shows
//       ?.map((show) => show.cinemaHall)
//       .filter(
//         (hall, index, self) => index === self.findIndex((h) => h.id === hall.id)
//       );

//     // Extract unique cinemas from halls
//     const cinemas = halls
//       ?.map((hall) => hall.cinema)
//       .filter(
//         (cinema) =>
//           cinema.address && // Ensure address exists
//           cinema.address.city.toLowerCase() === city.toLowerCase()
//       )
//       .filter(
//         (cinema, index, self) =>
//           index === self.findIndex((c) => c.id === cinema.id)
//       );

//     if (!cinemas.length) {
//       return NextResponse.json(
//         { message: `No cinemas found in ${city} showing this movie` },
//         { status: 404 }
//       );
//     }

//     // Structure the response data
//     const responseData = {
//       cinemas: cinemas?.map((cinema) => ({
//         id: cinema.id,
//         name: cinema.name,
//         address: cinema.address,
//       })),
//       shows: shows?.map((show) => ({
//         id: show.id,
//         movieId: show.movieId,
//         cinemaHallId: show.cinemaHallId,
//         startTime: show.startTime,
//       })),
//       halls: halls?.map((hall) => ({
//         id: hall.id,
//         name: hall.name,
//         totalSeats: hall.totalSeats,
//         cinemaId: hall.cinemaId,
//       })),
//       movie: shows[0]?.movie,
//     };
//     console.log("sdfjdf", shows, cinemas);

//     return NextResponse.json({ data: responseData }, { status: 200 });
//   } catch (error) {
//     console.error("Error fetching cinemas by city and movie:", error);
//     return NextResponse.json(
//       { message: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }

export async function getCinemasByCityAndMovie(
  city: string,
  movieId: string,
  todayDate: string
): Promise<NextResponse> {
  try {
    const today = new Date(todayDate);
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth();
    const todayDay = today.getDate();
    console.log("Parsed today:", todayYear, todayMonth, todayDay);
    const shows = await prisma.show.findMany({
      where: {
        movieId: movieId,
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
                address: {
                  where: {
                    city: {
                      equals: city,
                      mode: "insensitive",
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    // If no shows found, return early
    if (!shows.length) {
      return NextResponse.json(
        { message: `No shows found for this movie in ${city}` },
        { status: 404 }
      );
    }

    for (const show of shows) {
      const showDate = new Date(show.startTime);
      const showYear = showDate.getUTCFullYear();
      const showMonth = showDate.getUTCMonth();
      const showDay = showDate.getUTCDate();

      if (
        showYear !== todayYear ||
        showMonth !== todayMonth ||
        showDay !== todayDay
      ) {
        // Update the show's startTime to today’s date,
        const newStartTime = new Date(
          todayYear,
          todayMonth,
          todayDay,
          showDate.getUTCHours(),
          showDate.getUTCMinutes(),
          showDate.getUTCSeconds()
        );

        // Update the show
        await prisma.show.update({
          where: { id: show.id },
          data: { startTime: newStartTime },
        });

        // Reset all ShowSeat entries for this show
        await prisma.showSeat.updateMany({
          where: { showId: show.id },
          data: {
            isReserved: false,
            status: "AVAILABLE",
          },
        });

        // Update the show object in memory to reflect the new startTime
        show.startTime = newStartTime;
      }
    }

    //  unique cinema halls from shows
    const halls = shows
      ?.map((show) => show.cinemaHall)
      .filter(
        (hall, index, self) => index === self.findIndex((h) => h.id === hall.id)
      );

    //  unique cinemas from halls
    const cinemas = halls
      ?.map((hall) => hall.cinema)
      .filter(
        (cinema) =>
          cinema.address &&
          cinema.address.city.toLowerCase() === city.toLowerCase()
      )
      .filter(
        (cinema, index, self) =>
          index === self.findIndex((c) => c.id === cinema.id)
      );

    if (!cinemas.length) {
      return NextResponse.json(
        { message: `No cinemas found in ${city} showing this movie` },
        { status: 404 }
      );
    }

    // Structure the response data
    const responseData = {
      cinemas: cinemas?.map((cinema) => ({
        id: cinema.id,
        name: cinema.name,
        address: cinema.address,
      })),
      shows: shows?.map((show) => ({
        id: show.id,
        movieId: show.movieId,
        cinemaHallId: show.cinemaHallId,
        startTime: show.startTime,
      })),
      halls: halls?.map((hall) => ({
        id: hall.id,
        name: hall.name,
        totalSeats: hall.totalSeats,
        cinemaId: hall.cinemaId,
      })),
      movie: shows[0]?.movie,
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
