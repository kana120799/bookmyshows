import { NextRequest, NextResponse } from "next/server";
import { handleError } from "@/middleware/errorHandler";
import { prisma } from "@/lib/prisma";
import { hashedPassword } from "@/action/hash";

export const PUT = handleError(async (req: NextRequest) => {
  const { id, name, email, password, notificationsEnabled } = await req.json();

  if (!id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existingUser = await prisma.user.findUnique({
    where: { id },
    select: { password: true, notificationsEnabled: true },
  });

  if (!existingUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (existingUser.password === null && (name || email || password)) {
    return NextResponse.json(
      { error: "Profile updates are not allowed for Google login users" },
      { status: 403 }
    );
  }

  const updateData: {
    name?: string;
    email?: string;
    password?: string;
    notificationsEnabled?: boolean;
  } = {};

  if (name !== undefined) updateData.name = name;
  if (email !== undefined) updateData.email = email;
  if (notificationsEnabled !== undefined)
    updateData.notificationsEnabled = !existingUser.notificationsEnabled;

  if (password) {
    const hashedPassw = await hashedPassword(password);
    updateData.password = hashedPassw;
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json(
    {
      message: "Profile updated successfully",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        notificationsEnabled: updatedUser.notificationsEnabled,
      },
    },
    { status: 200 }
  );
});

export const GET = handleError(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existingUser = await prisma.user.findUnique({
    where: { id },
    select: {
      password: true,
      name: true,
      email: true,
      notificationsEnabled: true,
    },
  });

  if (!existingUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  return NextResponse.json(
    {
      user: {
        name: existingUser.name,
        email: existingUser.email,
        notificationsEnabled: existingUser.notificationsEnabled,
      },
    },
    { status: 200 }
  );
});
