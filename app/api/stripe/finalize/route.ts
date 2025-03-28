import { NextRequest, NextResponse } from "next/server";
import { handleError } from "@/middleware/errorHandler";
import { handlePaymentSuccess } from "@/controllers/bookingControllercopy1";

export const POST = handleError(async (req: NextRequest) => {
  const { paymentIntentId, bookingId } = await req.json();

  if (!paymentIntentId || !bookingId) {
    return NextResponse.json(
      { error: "Missing paymentIntentId or bookingId" },
      { status: 400 }
    );
  }

  return await handlePaymentSuccess({ paymentIntentId, bookingId });
});
