import { NextRequest } from "next/server";
import { deleteCinema } from "@/controllers/cinemaController";
import { handleError } from "@/middleware/errorHandler";

// Todo: check seat functionality

export const DELETE = handleError(
  async (req: NextRequest, params: { id: string }) => {
    const cinemaId = params.id;
    return await deleteCinema(cinemaId);
  }
);
// export const GET = handleError(
//   async (req: NextRequest, params: { id: string }) => {
//     // Extract the cinema ID from params
//     const cinemaId = params.id; // Get the cinema ID from params
//     return await deleteCinema(cinemaId); // Pass the cinema ID directly
//   }
// );
