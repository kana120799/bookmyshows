import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Add Cinema Hall
// export async function addCinemaHall({
//   name,
//   totalSeats,
//   cinemaId,
// }: {
//   name: string;
//   totalSeats: number;
//   cinemaId: string;
// }): Promise<NextResponse> {
//   const cinemaHall = await prisma.cinemaHall.create({
//     data: {
//       name: name,
//       totalSeats: totalSeats,
//       cinemaId: cinemaId,
//     },
//   });
//   return NextResponse.json(
//     {
//       message: "cinema hall created",
//       data: cinemaHall,
//     },
//     { status: 200 }
//   );
// }

// Update Cinema Hall
export async function updateCinemaHall(data: {
  id: string;
  name?: string;
  totalSeats?: number;
}): Promise<NextResponse> {
  const { id, name, totalSeats } = data;
  const cinemaHall = await prisma.cinemaHall.update({
    where: { id },
    data: {
      name: name,
      totalSeats: totalSeats,
    },
  });
  return NextResponse.json(
    {
      message: "cinema hall updated",
      data: cinemaHall,
    },
    { status: 200 }
  );
}

// Delete Cinema Hall
// export async function deleteCinemaHall(hallId: string): Promise<NextResponse> {
//   await prisma.cinemaHall.delete({
//     where: { id: hallId },
//   });
//   return NextResponse.json(
//     { message: "Cinema hall deleted successfully" },
//     { status: 200 }
//   );
// }
