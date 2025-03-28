import { NextRequest, NextResponse } from "next/server";
// import { confirmBooking } from "@/controllers/bookingControllercopy";
import { handleError } from "@/middleware/errorHandler";

export const POST = handleError(async (request: NextRequest) => {
  const { amount, userId, bookingKey } = await request.json();
  console.log(amount, userId, bookingKey);
  return NextResponse.json({ message: "random" }, { status: 200 });
  // return confirmBooking({ amount, userId, bookingKey });
});
