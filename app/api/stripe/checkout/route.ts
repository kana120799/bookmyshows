import { NextRequest } from "next/server";
import { confirmBooking } from "@/controllers/bookingController";
import { handleError } from "@/middleware/errorHandler";

export const POST = handleError(async (request: NextRequest) => {
  const { amount, userId, bookingKey } = await request.json();
  return confirmBooking({ amount, userId, bookingKey });
});
