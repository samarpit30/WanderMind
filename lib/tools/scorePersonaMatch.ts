import { PersonaScore } from "../types";

export async function scorePersonaMatch(
  placeId: string,
  placeName: string,
  placeCategory: string,
  personaTags: string[],
  freeText?: string
): Promise<PersonaScore> {
  console.log("scorePersonaMatch called for:", placeName);
  return {
    placeId,
    score: 85,
    reason: `Place matches the category '${placeCategory}' which aligns well with your interest tags: ${personaTags.join(", ")}.`,
  };
}
