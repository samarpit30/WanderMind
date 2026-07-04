import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("POST /api/agent request received:", body);

    // Return a stubbed response matching the API contract
    return NextResponse.json({
      assistantText: "Here are some places near your location that match your interests:",
      recommendations: [
        {
          placeId: "place-1",
          name: "Rajwada Palace",
          category: "Heritage",
          lat: 22.7196,
          lng: 75.8577,
          rating: 4.5,
          reviewCount: 1200,
          openingHoursToday: "9:00 AM - 5:00 PM",
        },
        {
          placeId: "place-2",
          name: "Sarafa Bazaar",
          category: "Foodie",
          lat: 22.7204,
          lng: 75.8601,
          rating: 4.7,
          reviewCount: 3400,
          openingHoursToday: "8:00 PM - 2:00 AM",
        },
      ],
      personaScores: [
        {
          placeId: "place-1",
          score: 95,
          reason: "Matches your Heritage and Temples interest with historical local prominence.",
        },
        {
          placeId: "place-2",
          score: 90,
          reason: "Indore's most famous street food night market fits your Foodie persona.",
        },
      ],
      toolTrace: ["geocode_location", "search_places", "score_persona_match"],
    });
  } catch (error: any) {
    console.error("Error in POST /api/agent:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
