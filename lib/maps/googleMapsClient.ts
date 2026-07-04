import { Place, Itinerary, TrafficAlert } from "../types";

export interface GeocodeResult {
  lat: number;
  lng: number;
  formattedAddress: string;
}

export async function geocodeLocation(query: string): Promise<GeocodeResult> {
  console.log("Mock geocodeLocation called for query:", query);
  return {
    lat: 22.7196,
    lng: 75.8577,
    formattedAddress: `${query}, Indore, Madhya Pradesh, India`,
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
  console.log("Mock searchPlaces called with params:", params);
  return [
    {
      placeId: "place-1",
      name: "Rajwada Palace",
      category: "Heritage",
      lat: 22.7196,
      lng: 75.8577,
      rating: 4.5,
      reviewCount: 1200,
    },
    {
      placeId: "place-2",
      name: "Sarafa Bazaar",
      category: "Foodie",
      lat: 22.7204,
      lng: 75.8601,
      rating: 4.7,
      reviewCount: 3400,
    },
  ];
}

export async function getPlaceDetails(placeId: string): Promise<Place> {
  console.log("Mock getPlaceDetails called for placeId:", placeId);
  return {
    placeId,
    name: placeId === "place-1" ? "Rajwada Palace" : "Sarafa Bazaar",
    category: placeId === "place-1" ? "Heritage" : "Foodie",
    lat: placeId === "place-1" ? 22.7196 : 22.7204,
    lng: placeId === "place-1" ? 75.8577 : 75.8601,
    rating: 4.6,
    reviewCount: 2000,
    priceLevel: 2,
    openingHoursToday: "9:00 AM - 11:00 PM",
    topReviews: [
      "Beautiful historical site in the center of the city.",
      "An absolute foodie paradise at night! Must visit.",
    ],
  };
}

export interface DirectionsParams {
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  waypoints: { lat: number; lng: number }[];
  mode: "driving" | "walking" | "transit";
}

export async function getDirectionsOptimized(params: DirectionsParams): Promise<Itinerary> {
  console.log("Mock getDirectionsOptimized called with params:", params);
  return {
    stops: [
      {
        place: {
          placeId: "place-1",
          name: "Rajwada Palace",
          category: "Heritage",
          lat: 22.7196,
          lng: 75.8577,
        },
        order: 1,
        arrivalEstimate: "10:00",
        durationHereMinutes: 60,
        travelToNextMinutes: 10,
        travelToNextMode: params.mode,
      },
      {
        place: {
          placeId: "place-2",
          name: "Sarafa Bazaar",
          category: "Foodie",
          lat: 22.7204,
          lng: 75.8601,
        },
        order: 2,
        arrivalEstimate: "11:10",
        durationHereMinutes: 90,
      },
    ],
    totalDurationMinutes: 160,
    totalDistanceKm: 1.5,
    polyline: "mock-polyline",
  };
}

export async function getTrafficStatus(itinerary: Itinerary): Promise<TrafficAlert[]> {
  console.log("Mock getTrafficStatus called for itinerary stops:", itinerary.stops.length);
  return [];
}
