import { getCinemaHalls } from "@/controllers/cinemaController";

import { handleError } from "@/middleware/errorHandler";
import { NextRequest } from "next/server";

export const GET = handleError(
  async (req: NextRequest, params: { id: string }) => {
    return await getCinemaHalls(params.id);
  }
);
