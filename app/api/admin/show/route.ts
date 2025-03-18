import { NextRequest } from "next/server";
import { getShow, setShow } from "@/controllers/showController";
import { handleError } from "@/middleware/errorHandler";

export const POST = handleError(async (req: NextRequest) => {
  const { movieId, cinemaHallId, startTime } = await req.json();
  return await setShow({ movieId, cinemaHallId, startTime });
});

export const GET = handleError(async () => {
  return await getShow();
});
