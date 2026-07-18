import { handleError } from "@/middleware/errorHandler";
import { getAdminBookingByID } from "@/controllers/movieController";
import { NextRequest } from "next/server";

export const GET = handleError(
  async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id: bookingId } = await params;
    return await getAdminBookingByID({ bookingId });
  }
);
