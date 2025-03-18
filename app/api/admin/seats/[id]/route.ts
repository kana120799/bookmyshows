import { NextRequest } from "next/server";
import { handleError } from "@/middleware/errorHandler";
import { getShowSeats } from "@/controllers/seatController";

export const GET = handleError(
  async (req: NextRequest, params: { id: string }) => {
    return await getShowSeats(params.id);
  }
);
