import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("POST /api/traffic-check request received:", body);

    // Return an empty array of alerts by default in the stub
    return NextResponse.json({
      alerts: [],
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    console.error("Error in POST /api/traffic-check:", error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
