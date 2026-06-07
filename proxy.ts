import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  const authHeader = request.headers.get("authorization");

  if (!authHeader) {
    return new NextResponse("Authentication required", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Admin Area"',
      },
    });
  }

  const encoded = authHeader.split(" ")[1];
  const decoded = atob(encoded);
  const [username, password] = decoded.split(":");

  if (username !== "admin" || password !== adminPassword) {
    return new NextResponse("Invalid credentials", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Admin Area"',
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};