import { NextRequest } from "next/server";
import { handleError } from "@/middleware/errorHandler";
import { initializeShowSeats } from "@/controllers/seatController";

// Todo: check seat functionality

export const POST = handleError(async (req: NextRequest) => {
  const { id, vipPrice, premiumPrice, regularPrice } = await req.json();

  return await initializeShowSeats({
    id,
    vipPrice,
    premiumPrice,
    regularPrice,
  });
});
