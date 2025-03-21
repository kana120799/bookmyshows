import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function getUsers() {
  const user = await prisma.user.findMany({
    include: { bookings: true, notifications: true },
  });
  if (!user) {
    throw new Error("User not found");
  }
  return NextResponse.json({ data: user }, { status: 200 });
}

export async function getUserBookings(userId: string) {
  const bookings = await prisma.booking.findMany({
    where: { userId },
    include: {
      show: {
        include: {
          cinemaHall: true,
        },
      },
      seats: {
        include: {
          showSeat: true,
        },
      },
      payment: true,
    },
  });
  if (!bookings) {
    throw new Error("Failed to fetch bookings");
  }
  return NextResponse.json({ data: bookings }, { status: 200 });
}

export async function deleteUser(userId: string) {
  const deletedUser = await prisma.user.delete({ where: { id: userId } });
  if (!deletedUser) {
    throw new Error("User not found");
  }
  return NextResponse.json(
    { message: "User deleted successfully" },
    { status: 200 }
  );
}

// export async function getUserById(userId: string) {
//   const user = await prisma.user.findUnique({
//     where: { id: userId },
//     include: { bookings: true, notifications: true },
//   });

//   if (!user) {
//     throw new Error("User not found");
//   }
//   return NextResponse.json(user, { status: 200 });
// }

// Todo :- update user profile

//  export async function updateUserProfile(userId: string, bodyData) {
//   const { name, email, phone } = bodyData;
//   const user = await prisma.user.update({
//     where: { id: userId },
//     data: { name, email, phone },
//   });
//  }
