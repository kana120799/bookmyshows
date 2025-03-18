import { lockBooking } from "@/controllers/bookingController";

export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  const selectedSeatIdsString = searchParams.get("selectedSeatIds");
  const totalString = searchParams.get("total");
  const userId = searchParams.get("userId") as string;
  const showId = searchParams.get("showId") as string;

  if (!selectedSeatIdsString) {
    return new Response("Missing selectedSeatIds", { status: 400 });
  }

  const selectedSeatIds = selectedSeatIdsString.split(",").filter(Boolean);
  if (selectedSeatIds.length === 0) {
    return new Response("No valid seat IDs provided", { status: 400 });
  }

  const total = parseInt(totalString || "0", 10);
  if (isNaN(total)) {
    return new Response("Invalid total amount", { status: 400 });
  }
  return await lockBooking({ selectedSeatIds, total, userId, showId });
}
