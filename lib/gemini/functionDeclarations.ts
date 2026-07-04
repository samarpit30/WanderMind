// Function declarations for Gemini tool calling.
// These match the schemas defined in Section 8 & 9.3 of the SDD.

export const geocodeLocationDeclaration = {
  name: "geocode_location",
  description: "Find the geographic coordinates (latitude and longitude) of a query string location.",
  parameters: {
    type: "OBJECT",
    properties: {
      query: { type: "STRING", description: "The location name or address to geocode." },
    },
    required: ["query"],
  },
};

export const searchPlacesDeclaration = {
  name: "search_places",
  description: "Find candidate places near a point, optionally filtered by category/keyword.",
  parameters: {
    type: "OBJECT",
    properties: {
      lat: { type: "NUMBER", description: "Latitude of center point." },
      lng: { type: "NUMBER", description: "Longitude of center point." },
      radiusM: { type: "NUMBER", description: "Search radius in meters." },
      category: { type: "STRING", description: "Category filter (e.g., heritage, food, nature)." },
      keyword: { type: "STRING", description: "Specific keyword search." },
    },
    required: ["lat", "lng", "radiusM"],
  },
};

export const getPlaceDetailsDeclaration = {
  name: "get_place_details",
  description: "Get detailed information about a specific place including reviews, opening hours, and price level.",
  parameters: {
    type: "OBJECT",
    properties: {
      placeId: { type: "STRING", description: "The unique Google Maps Place ID." },
    },
    required: ["placeId"],
  },
};

export const scorePersonaMatchDeclaration = {
  name: "score_persona_match",
  description: "Score how well a place fits the user's selected interest personas from 0 to 100, with a one-line explanation.",
  parameters: {
    type: "OBJECT",
    properties: {
      placeId: { type: "STRING" },
      placeName: { type: "STRING" },
      placeCategory: { type: "STRING" },
      personaTags: {
        type: "ARRAY",
        items: { type: "STRING" },
        description: "List of selected persona interest tags.",
      },
      freeText: { type: "STRING", description: "Optional free text interests from user." },
    },
    required: ["placeId", "placeName", "placeCategory", "personaTags"],
  },
};

export const getDirectionsOptimizedDeclaration = {
  name: "get_directions_optimized",
  description: "Compute the most optimized travel order and routes (waypoints) between an origin and destination.",
  parameters: {
    type: "OBJECT",
    properties: {
      origin: {
        type: "OBJECT",
        properties: { lat: { type: "NUMBER" }, lng: { type: "NUMBER" } },
        required: ["lat", "lng"],
      },
      destination: {
        type: "OBJECT",
        properties: { lat: { type: "NUMBER" }, lng: { type: "NUMBER" } },
        required: ["lat", "lng"],
      },
      waypoints: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: { lat: { type: "NUMBER" }, lng: { type: "NUMBER" } },
          required: ["lat", "lng"],
        },
        description: "Intermediate stops along the way.",
      },
      mode: {
        type: "STRING",
        enum: ["driving", "walking", "transit"],
        description: "Travel mode.",
      },
    },
    required: ["origin", "destination", "waypoints", "mode"],
  },
};

export const getTrafficStatusDeclaration = {
  name: "get_traffic_status",
  description: "Retrieve real-time traffic status updates for an active itinerary route.",
  parameters: {
    type: "OBJECT",
    properties: {
      itinerary: {
        type: "OBJECT",
        description: "The full active itinerary object to check traffic on.",
      },
    },
    required: ["itinerary"],
  },
};

export const buildOrUpdateItineraryDeclaration = {
  name: "build_or_update_itinerary",
  description: "Build a time-estimated, ordered itinerary, trimming places that exceed time budget.",
  parameters: {
    type: "OBJECT",
    properties: {
      places: {
        type: "ARRAY",
        items: { type: "OBJECT" },
        description: "List of places in the plan.",
      },
      timeBudgetHrs: { type: "NUMBER", description: "Allocated time budget in hours." },
      action: {
        type: "STRING",
        enum: ["build", "add", "remove", "reorder"],
      },
    },
    required: ["places", "timeBudgetHrs", "action"],
  },
};

export const generatePlaceStoryDeclaration = {
  name: "generate_place_story",
  description: "Generate a short (3-4 sentences) cultural narrative or backstory for a selected place.",
  parameters: {
    type: "OBJECT",
    properties: {
      placeId: { type: "STRING" },
      tone: {
        type: "STRING",
        enum: ["heritage", "casual"],
      },
    },
    required: ["placeId"],
  },
};

export const allTools = [
  geocodeLocationDeclaration,
  searchPlacesDeclaration,
  getPlaceDetailsDeclaration,
  scorePersonaMatchDeclaration,
  getDirectionsOptimizedDeclaration,
  getTrafficStatusDeclaration,
  buildOrUpdateItineraryDeclaration,
  generatePlaceStoryDeclaration,
];
