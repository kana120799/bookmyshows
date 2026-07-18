export const fakeUsers = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    role: "CUSTOMER",
    createdAt: new Date(),
  },
  {
    id: "2",
    name: "Jane Admin",
    email: "jane@example.com",
    role: "ADMIN",
    createdAt: new Date(),
  },
];

export const fakeBookings = [
  {
    id: "b1",
    userId: "1",
    showId: "s1",
    status: "CONFIRMED",
    createdAt: new Date("2025-03-15"),
  },
  {
    id: "b2",
    userId: "1",
    showId: "s2",
    status: "PENDING",
    createdAt: new Date("2025-03-16"),
  },
];

export const fakePayments = [
  {
    id: "p1",
    amount: 150.0,
    mode: "CARD",
    status: "COMPLETED",
    bookingId: "b1",
    createdOn: new Date(),
  },
  {
    id: "p2",
    amount: 200.0,
    mode: "UPI",
    status: "PENDING",
    bookingId: "b2",
    createdOn: new Date(),
  },
];

export const fakeShows = [
  {
    id: "s1",
    movieId: "m1",
    cinemaHallId: "ch1",
    startTime: new Date("2025-03-20T18:00:00"),
  },
  {
    id: "s2",
    movieId: "m2",
    cinemaHallId: "ch2",
    startTime: new Date("2025-03-21T20:00:00"),
  },
];

export const fakeMovies = [
  {
    id: "m1",
    title: "Movie A",
    durationMins: 120,
    genre: ["Action"],
    rating: 8.5,
  },
  {
    id: "m2",
    title: "Movie B",
    durationMins: 150,
    genre: ["Drama"],
    rating: 7.8,
  },
];

export const fakeCinemaHalls = [
  { id: "ch1", name: "Hall 1", totalSeats: 100, cinemaId: "c1" },
  { id: "ch2", name: "Hall 2", totalSeats: 150, cinemaId: "c1" },
];

export const fakeCinemas = [{ id: "c1", name: "Cinema XYZ", addressId: "a1" }];
