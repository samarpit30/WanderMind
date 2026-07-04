import { Place, Itinerary, TrafficAlert } from "../types";

interface GooglePlacePhoto {
  name: string;
}

interface GooglePlaceReview {
  text?: {
    text?: string;
  };
}

interface GooglePlaceResponse {
  id: string;
  displayName?: {
    text?: string;
  };
  primaryType?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  rating?: number;
  userRatingCount?: number;
  priceLevel?: string;
  currentOpeningHours?: {
    weekdayDescriptions?: string[];
  };
  photos?: GooglePlacePhoto[];
  reviews?: GooglePlaceReview[];
}

const getApiKey = () => {
  return process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
};

export interface GeocodeResult {
  lat: number;
  lng: number;
  formattedAddress: string;
}

export async function geocodeLocation(query: string): Promise<GeocodeResult> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("Google Maps API Key is not configured.");
  }

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${apiKey}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Geocoding failed with status: ${response.status}`);
  }

  const data = await response.json();
  if (data.status !== "OK" || !data.results || data.results.length === 0) {
    throw new Error(`Geocoding query '${query}' returned status: ${data.status}`);
  }

  const result = data.results[0];
  return {
    lat: result.geometry.location.lat,
    lng: result.geometry.location.lng,
    formattedAddress: result.formatted_address,
  };
}

export interface SearchPlacesParams {
  lat: number;
  lng: number;
  radiusM: number;
  category?: string;
  keyword?: string;
  nearPath?: { lat: number; lng: number }[];
}

export async function searchPlaces(params: SearchPlacesParams): Promise<Place[]> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("Google Maps API Key is not configured.");
  }

  // Places API (New) Text Search
  const url = `https://places.googleapis.com/v1/places:searchText`;
  const queryText = params.keyword || params.category || "scenic tourist attraction";

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "places.id,places.displayName,places.primaryType,places.rating,places.userRatingCount,places.location,places.currentOpeningHours,places.priceLevel,places.photos",
    },
    body: JSON.stringify({
      textQuery: queryText,
      maxResultCount: 12,
      locationBias: {
        circle: {
          center: {
            latitude: params.lat,
            longitude: params.lng,
          },
          radius: params.radiusM,
        },
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("searchPlaces API error:", errorText);
    throw new Error(`Places Search failed with status: ${response.status}`);
  }

  const data = await response.json();
  const places = data.places || [];

  return places.map((p: GooglePlaceResponse) => {
    // Determine opening hours today
    let openingHoursToday: string | undefined;
    if (p.currentOpeningHours?.weekdayDescriptions) {
      const dayIndex = new Date().getDay(); // 0 is Sunday, 1 is Monday
      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const todayStr = days[dayIndex];
      const todayDesc = p.currentOpeningHours.weekdayDescriptions.find((d: string) => d.startsWith(todayStr));
      openingHoursToday = todayDesc || p.currentOpeningHours.weekdayDescriptions[0];
    }

    // Resolve photo URL (Places API New naming format)
    let photoUrl: string | undefined;
    if (p.photos && p.photos.length > 0) {
      const photoName = p.photos[0].name; // e.g. places/ChIJ.../photos/AU37...
      photoUrl = `https://places.googleapis.com/v1/${photoName}/media?key=${apiKey}&maxHeightPx=300`;
    }

    // Map price levels
    let priceLevel: number | undefined;
    if (p.priceLevel) {
      const priceMap: Record<string, number> = {
        PRICE_LEVEL_FREE: 0,
        PRICE_LEVEL_INEXPENSIVE: 1,
        PRICE_LEVEL_MODERATE: 2,
        PRICE_LEVEL_EXPENSIVE: 3,
        PRICE_LEVEL_VERY_EXPENSIVE: 4,
      };
      priceLevel = priceMap[p.priceLevel];
    }

    return {
      placeId: p.id,
      name: p.displayName?.text || "Unknown Place",
      category: p.primaryType ? p.primaryType.replace(/_/g, " ") : "Scenic",
      lat: p.location?.latitude || params.lat,
      lng: p.location?.longitude || params.lng,
      rating: p.rating,
      reviewCount: p.userRatingCount,
      photoUrl,
      priceLevel,
      openingHoursToday,
    };
  });
}

export async function getPlaceDetails(placeId: string): Promise<Place> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("Google Maps API Key is not configured.");
  }

  // Places API (New) Place Details
  const url = `https://places.googleapis.com/v1/places/${placeId}`;
  
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "id,displayName,primaryType,rating,userRatingCount,priceLevel,currentOpeningHours,photos,reviews,location",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("getPlaceDetails API error:", errorText);
    throw new Error(`Place Details failed with status: ${response.status}`);
  }

  const p: GooglePlaceResponse = await response.json();

  let openingHoursToday: string | undefined;
  if (p.currentOpeningHours?.weekdayDescriptions) {
    const dayIndex = new Date().getDay();
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const todayStr = days[dayIndex];
    const todayDesc = p.currentOpeningHours.weekdayDescriptions.find((d: string) => d.startsWith(todayStr));
    openingHoursToday = todayDesc || p.currentOpeningHours.weekdayDescriptions[0];
  }

  let photoUrl: string | undefined;
  if (p.photos && p.photos.length > 0) {
    const photoName = p.photos[0].name;
    photoUrl = `https://places.googleapis.com/v1/${photoName}/media?key=${apiKey}&maxHeightPx=400`;
  }

  let priceLevel: number | undefined;
  if (p.priceLevel) {
    const priceMap: Record<string, number> = {
      PRICE_LEVEL_FREE: 0,
      PRICE_LEVEL_INEXPENSIVE: 1,
      PRICE_LEVEL_MODERATE: 2,
      PRICE_LEVEL_EXPENSIVE: 3,
      PRICE_LEVEL_VERY_EXPENSIVE: 4,
    };
    priceLevel = priceMap[p.priceLevel];
  }

  // Map review summaries (max 3 reviews)
  const topReviews = (p.reviews || []).slice(0, 3).map((r: GooglePlaceReview) => {
    const text = r.text?.text || "";
    // Truncate length to avoid flooding layout
    return text.length > 160 ? `${text.substring(0, 160)}...` : text;
  });

  return {
    placeId: p.id,
    name: p.displayName?.text || "Unknown Place",
    category: p.primaryType ? p.primaryType.replace(/_/g, " ") : "Scenic",
    lat: p.location?.latitude || 0,
    lng: p.location?.longitude || 0,
    rating: p.rating,
    reviewCount: p.userRatingCount,
    photoUrl,
    priceLevel,
    openingHoursToday,
    topReviews,
  };
}

export interface DirectionsParams {
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  waypoints: { lat: number; lng: number }[];
  mode: "driving" | "walking" | "transit";
}

export async function getDirectionsOptimized(params: DirectionsParams): Promise<Itinerary> {
  console.log("Mock getDirectionsOptimized called in client:", params);
  return {
    stops: [],
    totalDurationMinutes: 0,
    totalDistanceKm: 0,
    polyline: "",
  };
}

export async function getTrafficStatus(itinerary: Itinerary): Promise<TrafficAlert[]> {
  console.log("Mock getTrafficStatus called in client:", itinerary.stops.length);
  return [];
}
