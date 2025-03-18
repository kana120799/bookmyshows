import { NextRequest } from "next/server";
import { getCinemasByCityAndMovie } from "@/controllers/cinemaController";
import { handleError } from "@/middleware/errorHandler";

export const GET = handleError(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city") as string;
  const movieId = searchParams.get("movieId") as string;
  const todayDate = searchParams.get("date") as string;
  return await getCinemasByCityAndMovie(city, movieId, todayDate);
});
