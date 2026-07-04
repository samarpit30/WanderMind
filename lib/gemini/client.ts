import { GoogleGenAI } from "@google/genai";

// Initialize the Google Gemini API client
// This should only be used on the server side
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey && process.env.NODE_ENV === "production") {
  console.warn("GEMINI_API_KEY environment variable is not defined.");
}

export const gemini = new GoogleGenAI({ apiKey: apiKey || "mock-api-key" });
