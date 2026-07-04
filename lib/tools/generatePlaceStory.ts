export async function generatePlaceStory(placeId: string, tone?: "heritage" | "casual"): Promise<{ story_text: string }> {
  console.log("generatePlaceStory called for:", placeId);
  return {
    story_text: "This place holds historical significance in the heart of Indore. Legend has it that the Holkar rulers established this spot as a center of commerce and community gatherings. Today, it stands as an enduring symbol of Indore's rich heritage and vibrant local culture.",
  };
}
