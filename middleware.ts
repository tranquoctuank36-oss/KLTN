// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Routes } from "@/lib/routes";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  const protectedRoutes = [Routes.users()];

  const currentPath = request.nextUrl.pathname;
  const isProtected = protectedRoutes.some((path) =>
    currentPath.startsWith(path)
  );

  if (isProtected && !token) {
    const url = request.nextUrl.clone();
    url.pathname = Routes.home();
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/users/:path*"],
};
