import { getDirectionsOptimized as mapsGetDirections, DirectionsParams } from "../maps/googleMapsClient";

export async function getDirectionsOptimized(params: DirectionsParams) {
  return mapsGetDirections(params);
}
