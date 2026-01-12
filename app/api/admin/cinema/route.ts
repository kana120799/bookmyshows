import { NextRequest } from "next/server";
import { handleError } from "@/middleware/errorHandler";

import { addCinema, getCinema } from "@/controllers/cinemaController";

export const POST = handleError(async (req: NextRequest) => {
  const { name, address, halls } = await req.json();
  return await addCinema({ name, address, halls });
});

export const GET = handleError(async () => {
  return await getCinema();
});
