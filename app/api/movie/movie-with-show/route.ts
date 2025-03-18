import { getMoviesWithShows } from "@/controllers/movieController";

import { handleError } from "@/middleware/errorHandler";

export const GET = handleError(async () => {
  return await getMoviesWithShows();
});
