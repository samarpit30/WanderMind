import { NextResponse } from "next/server";
import { runOrchestrator } from "../../../lib/gemini/orchestrator";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("POST /api/agent request received:", body);

    const response = await runOrchestrator(body);
    return NextResponse.json(response);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    console.error("Error in POST /api/agent:", error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
