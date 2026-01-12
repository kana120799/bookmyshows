import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashedPassword } from "@/action/hash";

export async function POST(request: Request) {
  const { email, password, name } = await request.json();

  if (!email || !password || !name) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }
  if (
    email === process.env.ADMIN_EMAIL &&
    password === process.env.ADMIN_PASSWORD
  ) {
    return NextResponse.json({ error: "Invalid Credential" }, { status: 409 });
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json({ error: "User already exists" }, { status: 409 });
  }

  const hashedPw = await hashedPassword(password);
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPw,
      name,
      role: "CUSTOMER",
    },
  });
  return NextResponse.json(
    { message: "User registered successfully", userId: user.id },
    { status: 201 }
  );
}
