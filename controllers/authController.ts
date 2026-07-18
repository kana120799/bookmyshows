import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function signup(data: {
  name: string;
  email: string;
  phone: string;
  password: string;
}) {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    return NextResponse.json(
      { error: "Email already in use" },
      { status: 400 }
    );
  }

  //   const hashedPassword = await hashPassword(data.password);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: "hashedPassword",
    },
  });

  return NextResponse.json(
    { message: "User created successfully", user },
    { status: 200 }
  );
}

export async function login(data: { email: string; password: string }) {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  //   if (!user || !(await comparePassword(data.password, user.password))) {
  //     return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  //   }

  return NextResponse.json(
    { message: "Login successful", user },
    { status: 200 }
  );
}
