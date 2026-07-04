import { getPlaceDetails as mapsGetDetails } from "../maps/googleMapsClient";

export async function getPlaceDetails(placeId: string) {
  return mapsGetDetails(placeId);
}
