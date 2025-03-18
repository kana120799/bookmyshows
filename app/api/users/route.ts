import { deleteUser, getUsers } from "@/controllers/userController";
import { handleError } from "@/middleware/errorHandler";
import { NextResponse, NextRequest } from "next/server";

export const GET = handleError(async () => {
  return await getUsers();
});

export const DELETE = handleError(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("id");
  if (!userId)
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  return await deleteUser(userId);
});
