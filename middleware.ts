import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  if (!session) {
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  const userRole = session?.user?.role;

  // Admin access
  if (userRole === "ADMIN") {
    if (pathname.startsWith("/customer")) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    if (!pathname.startsWith("/admin") && pathname !== "/") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  // Customer access
  if (userRole === "CUSTOMER") {
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    if (!pathname.startsWith("/customer") && pathname !== "/") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // If no rules are violated, allow the request
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)", // Match all routes except these
  ],
};
