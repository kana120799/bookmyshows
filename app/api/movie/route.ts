import { NextRequest } from "next/server";
import { addMovie, fetchMovies } from "@/controllers/movieController";

import { handleError } from "@/middleware/errorHandler";
import { MovieType } from "@/types/movieType";

export const POST = handleError(async (req: NextRequest) => {
  const input: MovieType = await req.json();
  return await addMovie(input);
});

export const GET = handleError(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);

  const search = searchParams.get("search") || "";
  const language = searchParams.get("language") || "";
  const genre = searchParams.get("genre") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "6", 10);
  return await fetchMovies(search, language, genre, page, limit);
});
