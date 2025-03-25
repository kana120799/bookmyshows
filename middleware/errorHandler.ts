import { prisma } from "@/lib/prisma";
import { resetRedisClient } from "@/utils/redisClient";
import { NextRequest, NextResponse } from "next/server";

type AsyncHandler<T = { id: string }> = (
  req: NextRequest,
  params: T
) => Promise<NextResponse>;

export const handleError = <T = { id: string }>(fn: AsyncHandler<T>) => {
  return async (
    request: NextRequest,
    { params }: { params: Promise<T> }
  ): Promise<NextResponse> => {
    const resolvedParams = await params;
    try {
      return await fn(request, resolvedParams);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "User not found") {
          return NextResponse.json({ error: error.message }, { status: 404 });
        } else {
          return NextResponse.json({ error: "unknown error" }, { status: 404 });
        }
      }
      return NextResponse.json(
        { error: "An unknown error occurred" },
        { status: 500 }
      );
    } finally {
      await prisma.$disconnect();
      await resetRedisClient();
    }
  };
};
