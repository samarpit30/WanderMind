import { ChatMessage, Place, PersonaScore, Itinerary } from "../types";

export interface AgentRequest {
  message?: string;
  intent?: "search" | "build_itinerary" | "rescore" | "get_story";
  context: {
    persona: any;
    searchMode: any;
    locationQuery?: any;
    pathQuery?: any;
    activePlan?: any;
    chatHistory?: ChatMessage[];
  };
}

export interface AgentResponse {
  assistantText?: string;
  recommendations?: Place[];
  personaScores?: PersonaScore[];
  itinerary?: Itinerary;
  story?: string;
  clarifyingQuestion?: string;
  toolTrace?: string[];
}

export async function runOrchestrator(request: AgentRequest): Promise<AgentResponse> {
  console.log("Mock orchestrator running for intent:", request.intent || "chat");

  const response: AgentResponse = {
    assistantText: "I've processed your request. Here are the recommendations:",
    recommendations: [
      {
        placeId: "place-1",
        name: "Rajwada Palace",
        category: "Heritage",
        lat: 22.7196,
        lng: 75.8577,
        rating: 4.5,
        reviewCount: 1200,
      },
    ],
    personaScores: [
      {
        placeId: "place-1",
        score: 95,
        reason: "Excellent historic landmark matching your interests.",
      },
    ],
    toolTrace: ["geocode_location", "search_places", "score_persona_match"],
  };

  return response;
}
