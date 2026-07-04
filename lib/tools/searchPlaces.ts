import { searchPlaces as mapsSearch, SearchPlacesParams } from "../maps/googleMapsClient";

export async function searchPlaces(params: SearchPlacesParams) {
  return mapsSearch(params);
}
