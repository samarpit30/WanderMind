export type PersonaTag =
  | "heritage_temples"
  | "nature_hiking"
  | "foodie"
  | "art_museums"
  | "nightlife_social"
  | "family_friendly"
  | "offbeat_hidden_gems";

export interface UserPersona {
  tags: PersonaTag[];        // 1-3 selected
  freeText?: string;         // optional "in your own words"
}

export interface Place {
  placeId: string;
  name: string;
  category: string;
  lat: number;
  lng: number;
  rating?: number;
  reviewCount?: number;
  photoUrl?: string;
  priceLevel?: number;
  openingHoursToday?: string;
  topReviews?: string[];      // summarized, max 3
}

export interface PersonaScore {
  placeId: string;
  score: number;              // 0-100
  reason: string;             // one-line rationale
}

export interface ItineraryStop {
  place: Place;
  order: number;
  arrivalEstimate: string;    // ISO time or "HH:mm"
  durationHereMinutes: number;
  travelToNextMinutes?: number;
  travelToNextMode?: "driving" | "walking" | "transit";
}

export interface Itinerary {
  stops: ItineraryStop[];
  totalDurationMinutes: number;
  totalDistanceKm: number;
  polyline: string;            // encoded polyline for map rendering
}

export interface TrafficAlert {
  legIndex: number;
  affectedPlaceName: string;
  typicalDurationMinutes: number;
  currentDurationMinutes: number;
  delayMinutes: number;
}

export type SearchMode = "location" | "path";

export interface ChatMessage {
  role: "user" | "assistant";
  text?: string;
  recommendedPlaces?: Place[];  // if assistant response renders cards inline
  timestamp: number;
}
