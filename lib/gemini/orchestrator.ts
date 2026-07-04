/* eslint-disable @typescript-eslint/no-explicit-any */
import { gemini } from "./client";
import { orchestratorSystemPrompt } from "./systemPrompt";
import { allTools } from "./functionDeclarations";
import { geocodeLocation } from "../tools/geocodeLocation";
import { GeocodeResult } from "../maps/googleMapsClient";
import { searchPlaces } from "../tools/searchPlaces";
import { getPlaceDetails } from "../tools/getPlaceDetails";
import { scorePersonaMatch } from "../tools/scorePersonaMatch";
import { buildOrUpdateItinerary } from "../tools/buildOrUpdateItinerary";
import { getDirectionsOptimized } from "../tools/getDirectionsOptimized";
import { getTrafficStatus } from "../tools/getTrafficStatus";
import { generatePlaceStory } from "../tools/generatePlaceStory";
import { ChatMessage, Place, PersonaScore, Itinerary, UserPersona, SearchMode } from "../types";

export interface AgentRequest {
  message?: string;
  intent?: "search" | "build_itinerary" | "rescore" | "get_story";
  context: {
    persona: UserPersona;
    searchMode: SearchMode;
    locationQuery?: { lat: number; lng: number; formattedAddress: string } | null;
    pathQuery?: {
      origin: { lat: number; lng: number; formattedAddress: string };
      destination: { lat: number; lng: number; formattedAddress: string };
    } | null;
    activePlan?: Place[];
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
  geocodedLocation?: GeocodeResult;
  geocodedPath?: {
    origin: GeocodeResult;
    destination: GeocodeResult;
  };
}

async function executeLocalTool(name: string, args: any): Promise<any> {
  console.log(`Executing local tool [${name}] with args:`, args);
  switch (name) {
    case "geocode_location":
      return geocodeLocation(args.query);
    case "search_places":
      return searchPlaces({
        lat: args.lat,
        lng: args.lng,
        radiusM: args.radiusM,
        category: args.category,
        keyword: args.keyword,
      });
    case "get_place_details":
      return getPlaceDetails(args.placeId);
    case "score_persona_match":
      return scorePersonaMatch(
        args.placeId,
        args.placeName,
        args.placeCategory,
        args.personaTags,
        args.freeText
      );
    case "build_or_update_itinerary":
      return buildOrUpdateItinerary({
        places: args.places,
        timeBudgetHrs: args.timeBudgetHrs,
        action: args.action,
      });
    case "get_directions_optimized":
      return getDirectionsOptimized({
        origin: args.origin,
        destination: args.destination,
        waypoints: args.waypoints,
        mode: args.mode,
      });
    case "get_traffic_status":
      return getTrafficStatus(args.itinerary);
    case "generate_place_story":
      return generatePlaceStory(args.placeId, args.tone);
    default:
      throw new Error(`Tool ${name} not found.`);
  }
}

export async function runOrchestrator(request: AgentRequest): Promise<AgentResponse> {
  const { message, intent, context } = request;
  const { persona, searchMode, locationQuery, pathQuery, chatHistory = [] } = context;

  // 1. Build initial prompt from intent or message
  let promptText = "";
  if (intent === "search") {
    if (searchMode === "location" && locationQuery) {
      promptText = `The user clicked search for Single Location: "${locationQuery.formattedAddress}" (coordinates: lat ${locationQuery.lat}, lng ${locationQuery.lng}). Interests tags: [${persona.tags.join(", ")}]. Custom text: "${persona.freeText || ""}". Find recommended places and details.`;
    } else if (searchMode === "path" && pathQuery) {
      promptText = `The user clicked search for Route Path from "${pathQuery.origin.formattedAddress}" (lat ${pathQuery.origin.lat}, lng ${pathQuery.origin.lng}) to "${pathQuery.destination.formattedAddress}" (lat ${pathQuery.destination.lat}, lng ${pathQuery.destination.lng}). Interests tags: [${persona.tags.join(", ")}]. Custom text: "${persona.freeText || ""}". Find places along the route path.`;
    } else {
      promptText = "The user clicked search, but no location coordinates are set. Ask them where they want to go.";
    }
  } else if (intent === "get_story") {
    const activePlace = context.activePlan?.[0];
    if (activePlace) {
      promptText = `The user wants to hear the story for the place "${activePlace.name}" (ID: ${activePlace.placeId}). Please generate the place narrative story.`;
    } else {
      promptText = "The user wants a story, but no place was specified.";
    }
  } else if (message) {
    promptText = message;
  } else {
    return { assistantText: "How can I help you discover experience routes today?" };
  }

  // 2. Format history into Gemini API contents structure
  const contents: any[] = [];
  
  // Format past history
  chatHistory.slice(-10).forEach((msg) => {
    contents.push({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.text || "" }],
    });
  });

  // Append new user message
  contents.push({
    role: "user",
    parts: [{ text: promptText }],
  });

  // 3. Orchestration Tool Call Loop
  let loop = true;
  const toolTrace: string[] = [];
  let recommendations: Place[] = [];
  let personaScores: PersonaScore[] = [];
  let itinerary: Itinerary | undefined;
  let story: string | undefined;
  let finalResponseText = "";
  let geocodedLocation: GeocodeResult | undefined;
  let geocodedPath: {
    origin: GeocodeResult;
    destination: GeocodeResult;
  } | undefined;

  const toolsConfig = [{ functionDeclarations: allTools }];

  try {
    while (loop) {
      const response = await gemini.models.generateContent({
        model: "gemini-2.5-flash",
        contents,
        config: {
          systemInstruction: orchestratorSystemPrompt,
          tools: toolsConfig,
        },
      });

      const candidate = response.candidates?.[0];
      const parts = candidate?.content?.parts || [];
      const functionCalls = response.functionCalls || [];

      if (functionCalls.length > 0) {
        // Push the model's function call message to history
        contents.push({
          role: "model",
          parts: parts,
        });

        const responsesParts: any[] = [];

        for (const call of functionCalls) {
          if (!call.name) continue;
          toolTrace.push(call.name);
          let result;
          try {
            result = await executeLocalTool(call.name, call.args);
            
            // Intercept and collect structured data returned by tools
            if (call.name === "search_places" && Array.isArray(result)) {
              recommendations = [...recommendations, ...result];
            } else if (call.name === "geocode_location" && result && typeof result === "object") {
              const callArgs = (call.args || {}) as Record<string, any>;
              const queryStr = String(callArgs.query || "").toLowerCase();
              const originStr = (context.pathQuery?.origin?.formattedAddress || "").toLowerCase();
              const destStr = (context.pathQuery?.destination?.formattedAddress || "").toLowerCase();
              
              if (searchMode === "location") {
                geocodedLocation = result as GeocodeResult;
              } else if (searchMode === "path") {
                if (!geocodedPath) {
                  geocodedPath = {
                    origin: context.pathQuery?.origin || { lat: 0, lng: 0, formattedAddress: "" },
                    destination: context.pathQuery?.destination || { lat: 0, lng: 0, formattedAddress: "" }
                  };
                }
                if (originStr && queryStr.includes(originStr.substring(0, 5))) {
                  geocodedPath.origin = result as GeocodeResult;
                } else if (destStr && queryStr.includes(destStr.substring(0, 5))) {
                  geocodedPath.destination = result as GeocodeResult;
                } else {
                  if (geocodedPath.origin.lat === 0) {
                    geocodedPath.origin = result as GeocodeResult;
                  } else {
                    geocodedPath.destination = result as GeocodeResult;
                  }
                }
              }
            } else if (call.name === "score_persona_match" && result && typeof result === "object") {
              personaScores.push(result as PersonaScore);
            } else if (
              (call.name === "get_directions_optimized" || call.name === "build_or_update_itinerary") &&
              result &&
              typeof result === "object"
            ) {
              itinerary = result as Itinerary;
            } else if (call.name === "generate_place_story" && result && result.story_text) {
              story = result.story_text;
            }
          } catch (err: any) {
            console.error(`Error in tool execution [${call.name}]:`, err);
            result = { error: err.message || "Execution failed" };
          }

          responsesParts.push({
            functionResponse: {
              name: call.name,
              response: { result },
            },
          });
        }

        // Push tool responses to history
        contents.push({
          role: "tool",
          parts: responsesParts,
        });
      } else {
        loop = false;
        finalResponseText = response.text || "";
      }
    }
  } catch (error: any) {
    console.error("Gemini Orchestrator execution error:", error);
    return {
      assistantText: "I'm having trouble reasoning right now. Please try searching manually.",
      toolTrace,
    };
  }

  // If we collected recommendations but no scores, let's inject default scores so UI works
  if (recommendations.length > 0 && personaScores.length === 0) {
    personaScores = recommendations.map((r) => ({
      placeId: r.placeId,
      score: 85,
      reason: "Matches your selected interest categories.",
    }));
  }

  return {
    assistantText: finalResponseText || undefined,
    recommendations: recommendations.length > 0 ? recommendations : undefined,
    personaScores: personaScores.length > 0 ? personaScores : undefined,
    itinerary,
    story,
    toolTrace,
    geocodedLocation,
    geocodedPath,
  };
}
