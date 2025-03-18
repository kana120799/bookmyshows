import { NextRequest } from "next/server";
import { confirmBooking } from "@/controllers/bookingController";

export async function POST(request: NextRequest) {
  const { amount, userId, bookingKey } = await request.json();
  return confirmBooking({ amount, userId, bookingKey });
}
