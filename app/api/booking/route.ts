import { lockBooking } from "@/controllers/bookingController";
import { handleError } from "@/middleware/errorHandler";
import { NextRequest, NextResponse } from "next/server";

export const POST = handleError(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const selectedSeatIdsString = searchParams.get("selectedSeatIds");
  const totalString = searchParams.get("total");
  const userId = searchParams.get("userId") as string;
  const showId = searchParams.get("showId") as string;

  if (!selectedSeatIdsString) {
    return new NextResponse("Missing selectedSeatIds", { status: 400 });
  }

  const selectedSeatIds = selectedSeatIdsString.split(",").filter(Boolean);
  if (selectedSeatIds.length === 0) {
    return new NextResponse("No valid seat IDs provided", { status: 400 });
  }

  const total = parseInt(totalString || "0", 10);
  if (isNaN(total)) {
    return new NextResponse("Invalid total amount", { status: 400 });
  }
  return await lockBooking({ selectedSeatIds, total, userId, showId });
});
