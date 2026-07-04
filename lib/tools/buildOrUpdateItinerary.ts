import { Place, Itinerary } from "../types";

export interface BuildOrUpdateItineraryParams {
  places: Place[];
  timeBudgetHrs: number;
  action: "build" | "add" | "remove" | "reorder";
}

export async function buildOrUpdateItinerary(params: BuildOrUpdateItineraryParams): Promise<Itinerary> {
  console.log("buildOrUpdateItinerary called for places:", params.places.length);
  return {
    stops: params.places.map((place, index) => ({
      place,
      order: index + 1,
      arrivalEstimate: "12:00",
      durationHereMinutes: 60,
    })),
    totalDurationMinutes: params.places.length * 60,
    totalDistanceKm: params.places.length * 2,
    polyline: "mock-polyline",
  };
}
