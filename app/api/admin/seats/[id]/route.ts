import { NextRequest } from "next/server";
import { handleError } from "@/middleware/errorHandler";
import { getShowSeats } from "@/controllers/seatController";

export const GET = handleError(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    return await getShowSeats(id);
  }
);
