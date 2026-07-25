import { NextResponse } from "next/server";

import { ADMIN_SESSION_COOKIE } from "@/lib/admin-session";

function logOut(request: Request) {
  const logoutUrl = new URL("/admin/login", request.url);
  logoutUrl.searchParams.set("loggedOut", "1");

  const response = NextResponse.redirect(logoutUrl, 303);

  response.cookies.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/admin",
    expires: new Date(0),
    maxAge: 0,
  });

  return response;
}

export async function GET(request: Request) {
  return logOut(request);
}

export async function POST(request: Request) {
  return logOut(request);
}