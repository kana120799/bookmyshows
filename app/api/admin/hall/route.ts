import {
  deleteHallFromCinema,
  getCinemaHalls,
} from "@/controllers/cinemaController";
import { updateCinemaHall } from "@/controllers/cinemaHallController";
import { handleError } from "@/middleware/errorHandler";
import { NextRequest } from "next/server";

export const GET = handleError(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const cinemaId = searchParams.get("cinemaId") as string;
  return await getCinemaHalls(cinemaId);
});

// export const POST = handleError(async (req: NextRequest) => {
//   const data = await req.json();
//   const { name, totalSeats, cinemaId } = data;
//   return await addCinemaHall({ name, totalSeats, cinemaId });
// });

export const PUT = handleError(async (req: NextRequest) => {
  const data = await req.json();
  return await updateCinemaHall(data);
});

export const DELETE = handleError(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const cinemaId = searchParams.get("cinemaId") as string;
  const hallId = searchParams.get("hallId") as string;
  if (!hallId) throw new Error("Invalid request");
  return await deleteHallFromCinema(cinemaId, hallId);
});
