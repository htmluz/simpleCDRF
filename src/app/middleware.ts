import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  exp: number;
  role: string;
}

export function middleware(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const token = authHeader.split(" ")[1];

  try {
    const decodedToken = jwtDecode<DecodedToken>(token);
    const currTime = Math.floor(Date.now() / 1000);
    if (decodedToken.exp < currTime) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  } catch (error) {
    console.error(error);
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/main", "/configs"],
};
