import { handleError } from "@/middleware/errorHandler";
import { getAdminBooking } from "@/controllers/movieController";

export const GET = handleError(async () => {
  return await getAdminBooking();
});
