import { MovieType, MovieFilters } from "@/types/movieType";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
// import { dbQueryDuration, httpRequestDuration } from "@/lib/metrics";
// import { redis } from "@/utils/redisClient";
// import cloudinary from "@/lib/cloudinary";
// import {
//   CloudinaryError,
//   CloudinaryUploadResponse,
// } from "@/types/cloudinaryType";

// Add Movie:-

export async function addMovie(input: MovieType): Promise<NextResponse> {
  // if (Array.isArray(input)) {
  //   await prisma.movie.createMany({
  //     data: input,
  //   });
  // }
  // await prisma.movie.create({
  //   data: input,
  // });
  console.log(input);
  return NextResponse.json({ message: "Data Added" }, { status: 200 });
}

// Delete Movie

export async function deleteMovie(movieId: string): Promise<NextResponse> {
  await prisma.movie.delete({
    where: { id: movieId },
  });

  return NextResponse.json(
    { message: "Movie deleted successfully" },
    { status: 200 }
  );
}

// Get Movie by id

export async function getMovieById(movieId: string): Promise<NextResponse> {
  const data = await prisma.movie.findFirst({
    where: { id: movieId },
  });
  return NextResponse.json({ data }, { status: 200 });
}

// Get Movie
export async function fetchMovies(
  search?: string,
  language?: string,
  genre?: string,
  page: number = 1,
  limit: number = 6
) {
  // const cacheKey = `movies:${search || "all"}:${language || "all"}:${genre || "all"}:p${page}:l${limit}`;
  // console.log("Cache Key:", cacheKey);

  // let cachedResult = null;
  // let cacheError = null;

  // try {
  //   cachedResult = await redis.get(cacheKey);
  //   if (cachedResult) {
  //     console.log("Cache Hit:");
  //     return NextResponse.json(JSON.parse(cachedResult), { status: 200 });
  //   }
  //   console.log("Cache Miss");
  // } catch (error) {
  //   cacheError = error;
  //   console.error("Redis Cache Error (Falling back to DB):", cacheError);
  // }
  // const start = Date.now();

  const filters: MovieFilters = {
    OR: search
      ? [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ]
      : undefined,
    language: language ? { equals: language, mode: "insensitive" } : undefined,
    genre: genre ? { has: genre } : undefined,
  };

  // Remove undefined filters
  const cleanedFilters: Partial<MovieFilters> = Object.fromEntries(
    //Use an ESLint/TypeScript comment to suppress the warning (if configured in your project):
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Object.entries(filters).filter(([_, value]) => value !== undefined)
  );
  //  skip value for pagination
  const skip = (page - 1) * limit;

  const [movies, total] = await Promise.all([
    prisma.movie.findMany({
      where: cleanedFilters,
      orderBy: { releaseDate: "desc" },
      skip,
      take: limit,
      // fromCache: cachedResult !== null,
    }),
    // Get total count for reference
    prisma.movie.count({
      where: cleanedFilters,
    }),
  ]);

  // const duration = (Date.now() - start) / 1000;
  // dbQueryDuration.labels("movie", "get", "success").observe(duration);
  const response = {
    data: movies,
    page,
    limit,
    total,
    hasMore: skip + movies.length < total,
  };

  // if (!cacheError) {
  //   try {
  //     await redis.set(cacheKey, JSON.stringify(response), "EX", 3000);
  //     console.log("Cached with TTL:", await redis.ttl(cacheKey));
  //   } catch (error) {
  //     console.error("Redis Set Error (Data still served from DB):", error);
  //   }
  // }

  return NextResponse.json(response, { status: 200 });
}

export async function getMovieBySearch(search?: string) {
  const filters: MovieFilters = {
    OR: search
      ? [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ]
      : undefined,
  };

  return NextResponse.json(
    {
      data: filters,
    },
    { status: 200 }
  );
}

// Get Movie getMoviesWithShows

export async function getMoviesWithRegionShows(
  city?: string
): Promise<NextResponse> {
  // const start = Date.now();
  const movies = await prisma.movie.findMany({
    where: {
      shows: {
        some: {
          cinemaHall: {
            cinema: {
              address: city
                ? {
                    city: {
                      equals: city,
                    },
                  }
                : undefined,
            },
          },
        },
      },
    },
    orderBy: {
      releaseDate: "desc",
    },
  });

  // const duration = (Date.now() - start) / 1000;

  if (!movies.length) {
    // httpRequestDuration.labels("POST", "/api/movie", "500").observe(duration);
    throw new Error(`No movies with shows found${city ? ` in ${city}` : ""}`);
  }

  // httpRequestDuration.labels("POST", "/api/movie", "200").observe(duration);
  return NextResponse.json({ data: movies }, { status: 200 });
}

export async function getAdminBooking(
  page: number = 1,
  limit: number = 10
): Promise<NextResponse> {
  const skip = (page - 1) * limit;

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      skip,
      take: limit,
      include: {
        user: true,
        show: {
          include: {
            movie: true,
            cinemaHall: true,
          },
        },
        seats: {
          include: {
            showSeat: true,
          },
        },
        payment: true,
      },
    }),
    prisma.booking.count(),
  ]);

  if (!bookings) {
    throw new Error("Failed to fetch bookings");
  }

  return NextResponse.json(
    {
      data: bookings,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    },
    { status: 200 }
  );
}

export async function getAdminBookingByID({
  bookingId,
}: {
  bookingId: string;
}): Promise<NextResponse> {
  const bookings = await prisma.booking.findFirst({
    where: { id: bookingId },
    include: {
      user: true,
      show: {
        include: {
          movie: true,
          cinemaHall: true,
        },
      },
      seats: {
        include: {
          showSeat: true,
        },
      },
      payment: true,
      ticket: true,
    },
  });
  if (!bookings) {
    throw new Error("Failed to fetch bookings");
  }
  return NextResponse.json({ data: bookings }, { status: 200 });
}

// export async function uploadMovie(
//   movieId: string,
//   file: File
// ): Promise<NextResponse> {
//   const bytes = await file.arrayBuffer();
//   const buffer = Buffer.from(bytes);

//   const movieExists = await prisma.movie.findUnique({
//     where: {
//       id: movieId,
//     },
//   });

//   if (movieExists) {
//     const uploadResponse = await new Promise<CloudinaryUploadResponse>(
//       (resolve, reject) => {
//         cloudinary.uploader
//           .upload_stream(
//             { resource_type: "auto", folder: "bookmyshow/movies" },
//             (
//               error: CloudinaryError | undefined,
//               result: CloudinaryUploadResponse | undefined
//             ) => {
//               if (error) reject(error);
//               else if (result) resolve(result);
//               else reject(new Error("Upload failed without error"));
//             }
//           )
//           .end(buffer);
//       }
//     );

//     const imageUrl: string = uploadResponse.secure_url;
//     await prisma.movie.update({
//       where: {
//         id: movieId,
//       },
//       data: {
//         Poster: imageUrl,
//       },
//     });
//   } else {
//     throw new Error(`Movie with ID ${movieId} not found`);
//   }

//   return NextResponse.json(
//     { message: "url uploaded successfully" },
//     { status: 200 }
//   );
// }
