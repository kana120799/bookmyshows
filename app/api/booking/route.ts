import { lockBooking } from "@/controllers/bookingController";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const selectedSeatIdsString = searchParams.get("selectedSeatIds");
  const totalString = searchParams.get("total");
  const userId = searchParams.get("userId") as string;
  const showId = searchParams.get("showId") as string;

  if (!selectedSeatIdsString || !totalString || !userId || !showId) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  const selectedSeatIds = selectedSeatIdsString.split(",").filter(Boolean);
  const total = parseFloat(totalString);

  if (selectedSeatIds.length === 0 || isNaN(total)) {
    return NextResponse.json(
      { error: "Invalid seat IDs or total" },
      { status: 400 }
    );
  }

  return await lockBooking({ selectedSeatIds, total, userId, showId });
};
