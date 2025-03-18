import { NextRequest } from "next/server";
import { deleteMovie, getMovieById } from "@/controllers/movieController";
import { handleError } from "@/middleware/errorHandler";

export const DELETE = handleError(
  async (req: NextRequest, params: { id: string }) => {
    return await deleteMovie(params.id);
  }
);

export const GET = handleError(
  async (req: NextRequest, params: { id: string }) => {
    return await getMovieById(params.id);
  }
);
