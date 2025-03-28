// import { NextRequest, NextResponse } from "next/server";
// import { handleError } from "@/middleware/errorHandler";
// import { releaseSeats } from "@/controllers/bookingControllercopy1";
// import { initializeRedisClient } from "@/utils/redisClient";

// export const POST = handleError(async (req: NextRequest) => {
//   const { bookingKey } = await req.json();
//   const redis = await initializeRedisClient();

//   if (!bookingKey || typeof bookingKey !== "string") {
//     return NextResponse.json(
//       { error: "Invalid or missing bookingKey" },
//       { status: 400 }
//     );
//   }

//   if (!redis) {
//     return NextResponse.json(
//       { error: "Redis client not initialized" },
//       { status: 500 }
//     );
//   }

//   // Fetch booking data from Redis
//   const bookingDataStr = await redis.get(bookingKey);
//   if (!bookingDataStr) {
//     return NextResponse.json(
//       { error: "Booking session expired or invalid" },
//       { status: 400 }
//     );
//   }

//   const bookingData = JSON.parse(bookingDataStr);
//   const { selectedSeatIds } = bookingData;

//   if (!Array.isArray(selectedSeatIds) || selectedSeatIds.length === 0) {
//     return NextResponse.json(
//       { error: "No seats found to release" },
//       { status: 400 }
//     );
//   }

//   // Release the seats
//   await releaseSeats(selectedSeatIds);

//   // Clean up Redis
//   await redis.del(bookingKey);

//   return NextResponse.json(
//     { message: "Seats released successfully" },
//     { status: 200 }
//   );

//   // catch (error) {
//   //   console.error("Error releasing seats:", error);
//   //   const errorMessage =
//   //     error instanceof Error ? error.message : "Unknown error";
//   //   return NextResponse.json({ error: errorMessage }, { status: 500 });
//   // }
// });
