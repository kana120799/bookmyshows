import { NextRequest, NextResponse } from "next/server";
import { handleError } from "@/middleware/errorHandler";
import { prisma } from "@/lib/prisma";
import { hashedPassword } from "@/action/hash";

export const PUT = handleError(async (req: NextRequest) => {
  const { id, name, email, password } = await req.json();

  if (!id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existingUser = await prisma.user.findUnique({
    where: { id },
    select: { password: true },
  });

  if (!existingUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (existingUser.password === null) {
    return NextResponse.json(
      { error: "Profile updates are not allowed for Google login users" },
      { status: 403 }
    );
  }

  const updateData: {
    name: string;
    email: string;
    password?: string;
  } = { name, email };

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
      },
    },
    { status: 200 }
  );
});

// export const DELETE = handleError(async (req: NextRequest) => {
//   const { id } = await req.json();

// });
