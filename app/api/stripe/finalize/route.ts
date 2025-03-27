import { NextRequest, NextResponse } from "next/server";
import { finalizeBooking } from "@/controllers/bookingController";
import { handleError } from "@/middleware/errorHandler";

export const POST = handleError(async (req: NextRequest) => {
  const { paymentIntentId, bookingId } = await req.json();

  if (!paymentIntentId || !bookingId) {
    return NextResponse.json(
      { error: "Missing paymentIntentId or bookingId" },
      { status: 400 }
    );
  }

  return await finalizeBooking({ paymentIntentId, bookingId });
});
