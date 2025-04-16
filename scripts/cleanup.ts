// import { prisma } from "@/lib/prisma";
// import { unlockSeats } from "@/utils/redisLock";

// // Flag to prevent overlapping runs
// let isCleanupRunning = false;

// async function cleanupExpiredBookings() {
//   if (isCleanupRunning) {
//     console.log("Cleanup already in progress, skipping...");
//     return;
//   }

//   isCleanupRunning = true;
//   console.log("Cleanup started");

//   try {
//     const expiredBookings = await prisma.tempBooking.findMany({
//       where: { expiresAt: { lt: new Date() } },
//     });

//     if (expiredBookings.length === 0) {
//       console.log("No expired bookings found");
//       return;
//     }

//     for (const booking of expiredBookings) {
//       try {
//         await prisma.$transaction(async (tx) => {
//           // Unlock seats in Redis
//           await unlockSeats(booking.seatIds, booking.showId);

//           // Reset seat status to AVAILABLE
//           await tx.showSeat.updateMany({
//             where: { id: { in: booking.seatIds } },
//             data: { status: "AVAILABLE" },
//           });

//           // Delete the TempBooking if it still exists
//           const existingBooking = await tx.tempBooking.findUnique({
//             where: { id: booking.id },
//           });

//           if (existingBooking) {
//             await tx.tempBooking.delete({
//               where: { id: booking.id },
//             });
//             console.log(`Cleaned up expired booking: ${booking.id}`);
//           } else {
//             console.log(`Booking ${booking.id} already deleted, skipping...`);
//           }
//         });
//       } catch (error) {
//         console.error(`Error cleaning up booking ${booking.id}:`, error);
//       }
//     }
//   } catch (error) {
//     console.error("Error in cleanupExpiredBookings:", error);
//   } finally {
//     isCleanupRunning = false;
//   }
// }

// // Run every 60 seconds (adjust as needed)
// setInterval(async () => {
//   try {
//     await cleanupExpiredBookings();
//   } catch (error) {
//     console.error("Unexpected error in cleanup interval:", error);
//   }
// }, 60000);

// console.log("Cleanup service started...");

import { prisma } from "@/lib/prisma";
import { unlockSeats } from "@/utils/redisLock";

let isCleanupRunning = false;

export async function cleanupExpiredBookings() {
  if (isCleanupRunning) {
    console.log("Cleanup already in progress, skipping...");
    return;
  }

  isCleanupRunning = true;
  console.log("Cleanup started");

  try {
    const expiredBookings = await prisma.tempBooking.findMany({
      where: { expiresAt: { lt: new Date() } },
    });

    if (expiredBookings.length === 0) {
      console.log("No expired bookings found");
      return;
    }

    for (const booking of expiredBookings) {
      try {
        await prisma.$transaction(async (tx) => {
          await unlockSeats(booking.seatIds, booking.showId);
          await tx.showSeat.updateMany({
            where: { id: { in: booking.seatIds } },
            data: { status: "AVAILABLE" },
          });
          const existingBooking = await tx.tempBooking.findUnique({
            where: { id: booking.id },
          });
          if (existingBooking) {
            await tx.tempBooking.delete({
              where: { id: booking.id },
            });
            console.log(`Cleaned up expired booking: ${booking.id}`);
          } else {
            console.log(`Booking ${booking.id} already deleted, skipping...`);
          }
        });
      } catch (error) {
        console.error(`Error cleaning up booking ${booking.id}:`, error);
      }
    }
  } catch (error) {
    console.error("Error in cleanupExpiredBookings:", error);
  } finally {
    isCleanupRunning = false;
  }
}

console.log("Cleanup service started...");
