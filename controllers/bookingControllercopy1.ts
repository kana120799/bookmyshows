// import { prisma } from "@/lib/prisma";
// import { NextResponse } from "next/server";

// interface LockBookingParams {
//   selectedSeatIds: string[];
//   total: number;
//   userId: string;
//   showId: string;
// }

// // Cleanup expired bookings
// async function cleanupExpiredBookings(showId: string) {
//   const now = new Date();
//   return prisma.$transaction(async (tx) => {
//     const expiredBookings = await tx.tempBooking.findMany({
//       where: {
//         expiresAt: { lte: now },
//         showId
//       },
//       select: { id: true, seatIds: true },
//     });

//     if (expiredBookings.length > 0) {
//       const seatIdsToRelease = expiredBookings.flatMap((b) => b.seatIds);
//       await tx.showSeat.updateMany({
//         where: {
//           id: { in: seatIdsToRelease },
//           showId
//         },
//         data: { isReserved: false, status: "AVAILABLE" },
//       });

//       await tx.tempBooking.deleteMany({
//         where: { id: { in: expiredBookings.map((b) => b.id) } },
//       });
//     }
//   });
// }

// export async function lockBooking({
//   selectedSeatIds,
//   total,
//   userId,
//   showId,
// }: LockBookingParams): Promise<NextResponse> {
//   try {
//     // Input validation
//     if (!userId) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }
//     if (!selectedSeatIds.length || !total || !showId) {
//       return NextResponse.json(
//         { error: "Missing required fields" },
//         { status: 400 }
//       );
//     }

//     const result = await prisma.$transaction(async (tx) => {
//       // Step 1: Cleanup expired bookings first
//       await cleanupExpiredBookings(showId);

//       // Step 2: Lock and check seats with optimistic concurrency
//       const seats = await tx.showSeat.findMany({
//         where: {
//           id: { in: selectedSeatIds },
//           showId,
//           isReserved: false,
//           status: "AVAILABLE",
//         },
//         select: {
//           id: true,
//           price: true,
//           version: true, // Add version field to ShowSeat model for optimistic locking
//         },
//         // Use database-level locking if supported
//         // For PostgreSQL: { lock: "FOR UPDATE" }
//       });

//       if (seats.length !== selectedSeatIds.length) {
//         const availableSeatIds = seats.map((seat) => seat.id);
//         const unavailableSeats = selectedSeatIds.filter(
//           (id) => !availableSeatIds.includes(id)
//         );
//         throw new Error(`Seats unavailable: ${unavailableSeats.join(", ")}`);
//       }

//       // Step 3: Verify total
//       const calculatedTotal = seats.reduce((sum, seat) => sum + seat.price, 0);
//       if (calculatedTotal !== total) {
//         throw new Error("Total amount mismatch");
//       }

//       // Step 4: Reserve seats atomically
//       const updatePromises = selectedSeatIds.map((seatId) =>
//         tx.showSeat.update({
//           where: { id: seatId },
//           data: {
//             isReserved: true,
//             status: "RESERVED",
//             version: { increment: 1 } // Increment version for optimistic locking
//           },
//           select: { id: true },
//         })
//       );
//       await Promise.all(updatePromises);

//       // Step 5: Create temporary booking
//       const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
//       const tempBooking = await tx.tempBooking.create({
//         data: {
//           userId,
//           showId,
//           seatIds: selectedSeatIds,
//           total,
//           expiresAt,
//         },
//       });

//       return { tempBooking, seats };
//     });

//     return NextResponse.json(
//       {
//         message: "Seats locked successfully",
//         data: {
//           bookingId: result.tempBooking.id,
//           userId,
//           showId,
//           selectedSeatIds,
//           total,
//           expiresAt: result.tempBooking.expiresAt,
//         },
//       },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("Booking error:", error);
//     return NextResponse.json(
//       {
//         error: error instanceof Error ? error.message : "Booking failed",
//       },
//       { status: error instanceof Error && error.message.includes("Seats unavailable") ? 409 : 500 }
//     );
//   }
// }
