import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: false,
    message:
      "Sample property seeding is disabled. Orbital One now uses database-backed lunar atlas inventory.",
  });
}