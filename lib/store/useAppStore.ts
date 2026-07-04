import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  UserPersona,
  SearchMode,
  Place,
  PersonaScore,
  Itinerary,
  TrafficAlert,
  ChatMessage,
} from "../types";

export interface AppState {
  persona: UserPersona;
  searchMode: SearchMode;
  locationQuery: { lat: number; lng: number; formattedAddress: string } | null;
  pathQuery: {
    origin: { lat: number; lng: number; formattedAddress: string };
    destination: { lat: number; lng: number; formattedAddress: string };
  } | null;
  recommendations: Place[];
  personaScores: Record<string, PersonaScore>;
  activePlan: Place[];
  itinerary: Itinerary | null;
  trafficAlerts: TrafficAlert[];
  chatHistory: ChatMessage[];
  uiStatus: "idle" | "loading" | "error";
  statusMessage?: string;

  // Actions
  setPersona: (persona: UserPersona) => void;
  setSearchMode: (mode: SearchMode) => void;
  setLocationQuery: (
    query: { lat: number; lng: number; formattedAddress: string } | null
  ) => void;
  setPathQuery: (
    query: {
      origin: { lat: number; lng: number; formattedAddress: string };
      destination: { lat: number; lng: number; formattedAddress: string };
    } | null
  ) => void;
  setRecommendations: (recommendations: Place[]) => void;
  addToPlan: (place: Place) => void;
  removeFromPlan: (placeId: string) => void;
  setItinerary: (itinerary: Itinerary | null) => void;
  pushTrafficAlert: (alert: TrafficAlert) => void;
  resolveTrafficAlert: (legIndex: number) => void;
  pushChatMessage: (message: ChatMessage) => void;
  setUiStatus: (status: "idle" | "loading" | "error", message?: string) => void;
}

const defaultPersona: UserPersona = {
  tags: ["offbeat_hidden_gems", "foodie"],
  freeText: "",
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      persona: defaultPersona,
      searchMode: "location",
      locationQuery: null,
      pathQuery: null,
      recommendations: [],
      personaScores: {},
      activePlan: [],
      itinerary: null,
      trafficAlerts: [],
      chatHistory: [],
      uiStatus: "idle",
      statusMessage: "",

      setPersona: (persona) => set({ persona }),
      setSearchMode: (searchMode) => set({ searchMode }),
      setLocationQuery: (locationQuery) => set({ locationQuery }),
      setPathQuery: (pathQuery) => set({ pathQuery }),
      setRecommendations: (recommendations) => set({ recommendations }),
      addToPlan: (place) =>
        set((state) => ({
          activePlan: state.activePlan.some((p) => p.placeId === place.placeId)
            ? state.activePlan
            : [...state.activePlan, place],
        })),
      removeFromPlan: (placeId) =>
        set((state) => ({
          activePlan: state.activePlan.filter((p) => p.placeId !== placeId),
        })),
      setItinerary: (itinerary) => set({ itinerary }),
      pushTrafficAlert: (alert) =>
        set((state) => ({
          trafficAlerts: [...state.trafficAlerts, alert],
        })),
      resolveTrafficAlert: (legIndex) =>
        set((state) => ({
          trafficAlerts: state.trafficAlerts.filter(
            (a) => a.legIndex !== legIndex
          ),
        })),
      pushChatMessage: (message) =>
        set((state) => ({
          chatHistory: [...state.chatHistory, message],
        })),
      setUiStatus: (uiStatus, statusMessage) =>
        set({ uiStatus, statusMessage }),
    }),
    {
      name: "wandermind-app-store",
    }
  )
);
