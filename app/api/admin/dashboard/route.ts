import { getTotals } from "@/controllers/dashboardController";
import { handleError } from "@/middleware/errorHandler";

export const GET = handleError(async () => {
  return await getTotals();
});
