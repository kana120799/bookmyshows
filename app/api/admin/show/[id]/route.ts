import { NextRequest } from "next/server";
import { handleError } from "@/middleware/errorHandler";
import { deleteShow } from "@/controllers/showController";

export const DELETE = handleError(
  async (req: NextRequest, params: { id: string }) => {
    return await deleteShow(params.id);
  }
);
