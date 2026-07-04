import { gemini } from "../gemini/client";
import { Type } from "@google/genai";
import { PersonaScore } from "../types";

export async function scorePersonaMatch(
  placeId: string,
  placeName: string,
  placeCategory: string,
  personaTags: string[],
  freeText?: string
): Promise<PersonaScore> {
  console.log("Real scorePersonaMatch called for:", placeName, "interests:", personaTags, "freeText:", freeText);

  const prompt = `
Evaluate how well the following place matches the user's travel preferences:
- Place Name: "${placeName}"
- Place Category: "${placeCategory}"

User Travel Preferences:
- Selected Interest Tags: [${personaTags.join(", ")}]
- Custom Text Preferences: "${freeText || "None"}"

Output a percentage match score (integer from 0 to 100) and a concise, user-friendly 1-sentence reason explanation.
`;

  try {
    const response = await gemini.models.generateContent({
      model: "gemini-3.1-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a professional travel analyst scoring places against user personas. Be realistic and objective.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER, description: "Match score from 0 to 100." },
            reason: { type: Type.STRING, description: "Concise 1-sentence explanation of why it fits or does not fit." },
          },
          required: ["score", "reason"],
        },
      },
    });

    const text = response.text || "{}";
    const data = JSON.parse(text);

    return {
      placeId,
      score: typeof data.score === "number" ? Math.min(100, Math.max(0, Math.round(data.score))) : 80,
      reason: data.reason || "Matches your interest tags.",
    };
  } catch (error) {
    console.error("Error in scorePersonaMatch Gemini call:", error);
    return {
      placeId,
      score: 80,
      reason: "Matches your selected interest categories.",
    };
  }
}
