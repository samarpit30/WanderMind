import { geocodeLocation as mapsGeocode } from "../maps/googleMapsClient";

export async function geocodeLocation(query: string) {
  return mapsGeocode(query);
}
