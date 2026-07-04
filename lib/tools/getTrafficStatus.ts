import { getTrafficStatus as mapsGetTraffic } from "../maps/googleMapsClient";
import { Itinerary } from "../types";

export async function getTrafficStatus(itinerary: Itinerary) {
  return mapsGetTraffic(itinerary);
}
