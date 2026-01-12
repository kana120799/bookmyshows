import { prisma } from "@/lib/prisma";

// --- Types ---
export interface MovieFilters {
    title?: string;
    genre?: string;
    language?: string;
    minRating?: number;
    actor?: string;
}

export interface CinemaFilters {
    city?: string;
    name?: string;
    minSeats?: number;
    location?: string;
}

export interface BookingFilters {
    status?: "CONFIRMED" | "CANCELLED" | "PENDING";
    count?: number;
}

// --- Tools ---

export const findMovies = async (filters: MovieFilters) => {
    console.log(`Finding movies with filters: ${JSON.stringify(filters)}`);
    const where: any = {};

    if (filters.title) where.title = { contains: filters.title, mode: "insensitive" };
    if (filters.genre) where.genre = { hasSome: [filters.genre] };
    if (filters.language) where.language = { contains: filters.language, mode: "insensitive" };
    if (filters.minRating) where.rating = { gte: filters.minRating };
    if (filters.actor) where.Actors = { hasSome: [filters.actor] };

    const movies = await prisma.movie.findMany({
        where,
        take: 5,
        orderBy: { rating: 'desc' } // Default to best rated if generic search
    });

    if (movies.length === 0) {
        // Fallback: If no strict match, show top rated movies
        const topMovies = await prisma.movie.findMany({
            take: 3,
            orderBy: { rating: 'desc' }
        });
        return `I couldn't find exact matches for those filters, but here are our Top Rated movies:\n${JSON.stringify(topMovies.map(m => m.title), null, 2)}`;
    }

    return JSON.stringify(movies.map(m => ({
        title: m.title,
        genre: m.genre,
        rating: m.rating,
        language: m.language,
        description: m.description
    })), null, 2);
};

export const findShows = async (movieName: string) => {
    // Keep this simple for now, can be upgraded later
    console.log(`Finding shows for movie: ${movieName}`);
    const movie = await prisma.movie.findFirst({
        where: { title: { contains: movieName, mode: "insensitive" } }
    });
    if (!movie) return `Movie '${movieName}' not found.`;

    const shows = await prisma.show.findMany({
        where: {
            movieId: movie.id,
            startTime: { gte: new Date() }
        },
        include: {
            cinemaHall: {
                include: { cinema: { include: { address: true } } }
            }
        },
        orderBy: { startTime: 'asc' },
        take: 5
    });

    if (shows.length === 0) return `No upcoming shows found for '${movie.title}'.`;

    return JSON.stringify(shows.map(s => ({
        movie: movie.title,
        cinema: s.cinemaHall.cinema.name,
        location: s.cinemaHall.cinema.address?.city,
        time: s.startTime.toLocaleString(),
    })), null, 2);
};

export const findCinemas = async (filters: CinemaFilters) => {
    console.log(`Finding cinemas with filters: ${JSON.stringify(filters)}`);

    // Build query
    const where: any = {};

    // 1. Basic Filters
    if (filters.name) where.name = { contains: filters.name, mode: "insensitive" };

    // 2. Address Filters (Joined)
    if (filters.city || filters.location) {
        where.address = {};
        if (filters.city) where.address.city = { contains: filters.city, mode: "insensitive" };
        if (filters.location) where.address.street = { contains: filters.location, mode: "insensitive" };
    }

    // 3. Complex Filters (Seats)
    // We need to check if ANY hall in the cinema meets the criteria
    if (filters.minSeats) {
        where.halls = {
            some: {
                totalSeats: { gte: filters.minSeats }
            }
        };
    }

    const cinemas = await prisma.cinema.findMany({
        where,
        include: {
            address: true,
            halls: true
        },
        take: 5
    });

    if (cinemas.length === 0) return "No cinemas found matching your criteria.";

    return JSON.stringify(cinemas.map(c => ({
        name: c.name,
        address: `${c.address?.street}, ${c.address?.city}`,
        totalHalls: c.halls.length,
        // Show max capacity to prove we met criteria
        maxHallCapacity: Math.max(...c.halls.map(h => h.totalSeats))
    })), null, 2);
};

export const findBookings = async (userId: string, filters: BookingFilters) => {
    console.log(`Finding bookings for User ${userId} with filters: ${JSON.stringify(filters)}`);

    const where: any = { userId: userId };

    if (filters.status) where.status = filters.status;

    const bookings = await prisma.booking.findMany({
        where,
        include: {
            show: {
                include: { movie: true, cinemaHall: { include: { cinema: true } } }
            },
            seats: {
                include: { showSeat: true }
            }
        },
        orderBy: { id: 'desc' },
        take: filters.count || 3
    });

    if (bookings.length === 0) return "You have no bookings matching that status.";

    return JSON.stringify(bookings.map(b => ({
        id: b.id,
        movie: b.show.movie.title,
        cinema: b.show.cinemaHall.cinema.name,
        date: b.show.startTime.toLocaleString(),
        status: b.status,
        seats: b.seats.length,
        seatNumbers: b.seats.map(s => `${s.showSeat.row}${s.showSeat.column}`).join(", ")
    })), null, 2);
};
