import { getCinemaHalls } from "@/controllers/cinemaController";

import { handleError } from "@/middleware/errorHandler";
import { NextRequest } from "next/server";

export const GET = handleError(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    return await getCinemaHalls(id);
  }
);
