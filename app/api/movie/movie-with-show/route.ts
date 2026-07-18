import { getMoviesWithRegionShows } from "@/controllers/movieController";

import { handleError } from "@/middleware/errorHandler";
import { NextRequest } from "next/server";

export const GET = handleError(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city")?.toLowerCase() as string;
  return await getMoviesWithRegionShows(city);
});
