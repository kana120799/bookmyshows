import { NextRequest } from "next/server";
import { handleError } from "@/middleware/errorHandler";
import { deleteShow } from "@/controllers/showController";

export const DELETE = handleError(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    return await deleteShow(id);
  }
);
