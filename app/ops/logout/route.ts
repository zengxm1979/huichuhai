import { NextResponse, type NextRequest } from "next/server";
import { OPS_REVIEW_SESSION_COOKIE } from "@/lib/deployment/reviewAccess";

export function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/ops/login?loggedOut=1", request.url));
  response.cookies.set(OPS_REVIEW_SESSION_COOKIE, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/ops",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}
