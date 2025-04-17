import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  if (pathname === "/payment-success") {
    return NextResponse.next();
  }

  if (!session) {
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  const userRole = session?.user?.role;

  // Admin access
  if (userRole === "ADMIN") {
    console.log("Admin redirect check:", pathname);
    if (pathname.startsWith("/customer")) {
      console.log("Redirecting admin from customer to /admin");
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

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/.*|favicon.ico).*)"],
};
