import { NextRequest } from "next/server";
import { deleteMovie, getMovieById } from "@/controllers/movieController";
import { handleError } from "@/middleware/errorHandler";

export const DELETE = handleError(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    return await deleteMovie(id);
  }
);

export const GET = handleError(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    return await getMovieById(id);
  }
);
