import { handleError } from "@/middleware/errorHandler";
import { getAdminBookingByID } from "@/controllers/movieController";
import { NextRequest } from "next/server";

export const GET = handleError(
  async (request: NextRequest, params: { id: string }) => {
    const bookingId = params.id;
    return await getAdminBookingByID({ bookingId });
  }
);
