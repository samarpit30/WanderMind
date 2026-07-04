"use client";

import React from "react";
import { APIProvider } from "@vis.gl/react-google-maps";
import { useAppStore } from "../lib/store/useAppStore";
import PersonaPicker from "../components/onboarding/PersonaPicker";
import ModeToggle from "../components/search/ModeToggle";
import LocationSearchBox from "../components/search/LocationSearchBox";
import PathSearchBox from "../components/search/PathSearchBox";
import MapCanvas from "../components/map/MapCanvas";

// Import stubs for layout placement
import RecommendationsPanel from "../components/recommendations/RecommendationsPanel";
import ChatPanel from "../components/chat/ChatPanel";
import ChatBubbleButton from "../components/chat/ChatBubbleButton";

const MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

const PERSONA_LABELS: Record<string, string> = {
  heritage_temples: "🏛️ Heritage",
  nature_hiking: "⛰️ Nature",
  foodie: "🍔 Foodie",
  art_museums: "🎨 Art",
  nightlife_social: "🍻 Nightlife",
  family_friendly: "Family",
  offbeat_hidden_gems: "💎 Offbeat",
};

export default function Home() {
  const [activeMobileTab, setActiveMobileTab] = React.useState<"list" | "map">("list");

  const {
    isOnboarded,
    setIsOnboarded,
    searchMode,
    persona,
    locationQuery,
    pathQuery,
    setRecommendations,
    setPersonaScores,
    setUiStatus,
    activePlan,
    removeFromPlan,
    setLocationQuery,
  } = useAppStore();

  const handleEditPersona = () => {
    setIsOnboarded(false);
  };

  const triggerSearch = React.useCallback(async () => {
    setUiStatus("loading", "Understanding your request...");
    const statusSequence = [
      "Analyzing user persona...",
      "Scouting nearby Google Places...",
      "Scoring persona matches...",
      "Organizing recommendations...",
    ];
    let seqIndex = 0;
    const seqInterval = setInterval(() => {
      if (seqIndex < statusSequence.length) {
        setUiStatus("loading", statusSequence[seqIndex]);
        seqIndex++;
      }
    }, 1200);

    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intent: "search",
          context: {
            persona,
            searchMode,
            locationQuery,
            pathQuery,
          },
        }),
      });

      clearInterval(seqInterval);

      if (!response.ok) throw new Error("Search failed");
      const data = await response.json();

      if (data.recommendations) {
        setRecommendations(data.recommendations);
      }
      if (data.personaScores) {
        setPersonaScores(data.personaScores);
      }
      setUiStatus("idle");
    } catch (err) {
      clearInterval(seqInterval);
      console.error(err);
      setUiStatus("error", "Search failed");
      setTimeout(() => setUiStatus("idle"), 3000);
    }
  }, [persona, searchMode, locationQuery, pathQuery, setRecommendations, setPersonaScores, setUiStatus]);

  React.useEffect(() => {
    if (searchMode === "location" && locationQuery) {
      triggerSearch();
    }
  }, [locationQuery, searchMode, triggerSearch]);

  React.useEffect(() => {
    if (searchMode === "path" && pathQuery) {
      triggerSearch();
    }
  }, [pathQuery, searchMode, triggerSearch]);

  return (
    <APIProvider apiKey={MAPS_API_KEY} libraries={["places"]}>
      <div className="flex flex-col lg:flex-row min-h-screen bg-zinc-950 text-zinc-100 font-sans antialiased overflow-hidden">
        {/* Onboarding View */}
        {!isOnboarded && <PersonaPicker />}

        {/* Mobile Tab Toggle Bar */}
        <div className="lg:hidden flex border-b border-zinc-900 bg-zinc-950/95 sticky top-0 z-20 shrink-0">
          <button
            type="button"
            onClick={() => setActiveMobileTab("list")}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider text-center transition-all ${
              activeMobileTab === "list" ? "text-violet-400 border-b-2 border-violet-500 bg-zinc-900/20" : "text-zinc-500"
            }`}
          >
            📋 Discover & Plan
          </button>
          <button
            type="button"
            onClick={() => setActiveMobileTab("map")}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider text-center transition-all ${
              activeMobileTab === "map" ? "text-violet-400 border-b-2 border-violet-500 bg-zinc-900/20" : "text-zinc-500"
            }`}
          >
            🗺️ Map View
          </button>
        </div>

        {/* Left Side Panel: Search Controls, Chat, and Recommendations */}
        <aside className={`w-full h-[calc(100vh-48px)] lg:w-[420px] lg:h-screen shrink-0 border-b lg:border-b-0 lg:border-r border-zinc-900 bg-zinc-950/80 backdrop-blur flex flex-col overflow-y-auto ${
          activeMobileTab === "list" ? "flex" : "hidden lg:flex"
        }`}>
          {/* Header */}
          <header className="p-6 border-b border-zinc-900 flex justify-between items-center bg-zinc-950/90 sticky top-0 z-10">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                WanderMind
              </h1>
              <p className="text-xs text-zinc-500 font-medium">Agentic Travel Discovery</p>
            </div>
            {isOnboarded && (
              <button
                onClick={handleEditPersona}
                className="text-xs font-semibold px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-850 hover:border-zinc-700 transition-all text-zinc-400 hover:text-zinc-200"
              >
                Edit Preferences
              </button>
            )}
          </header>

          {/* Configuration & Inputs */}
          <div className="p-6 flex flex-col gap-5 border-b border-zinc-900">
            {/* Search Mode Toggle */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Search Mode</span>
              <ModeToggle />
            </div>

            {/* Conditional Input Search Box */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Destination Inputs</span>
              {searchMode === "location" ? <LocationSearchBox /> : <PathSearchBox />}
            </div>

            {/* Active Personas Tag Display */}
            {isOnboarded && (
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Interests</span>
                <div className="flex flex-wrap gap-2">
                  {persona.tags.map((tag) => (
                    <span
                      key={tag}
                      onClick={handleEditPersona}
                      className="text-xs font-medium px-2.5 py-1 bg-violet-600/10 border border-violet-500/20 text-violet-400 rounded-full cursor-pointer hover:bg-violet-600/25 transition-all"
                    >
                      {PERSONA_LABELS[tag] || tag}
                    </span>
                  ))}
                  {persona.freeText && (
                    <span
                      onClick={handleEditPersona}
                      className="text-xs font-medium px-2.5 py-1 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-full cursor-pointer hover:bg-zinc-850 line-clamp-1 max-w-[150px]"
                      title={persona.freeText}
                    >
                      📝 Custom
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Placeholders for recommendations and chat in sidebar */}
          <div className="flex-1 flex flex-col p-6 gap-6">
            <RecommendationsPanel />

            {/* Active Plan List Section */}
            {activePlan.length > 0 && (
              <div className="flex flex-col gap-3 border-t border-zinc-900 pt-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">My Travel Plan</h3>
                  <span className="text-[10px] text-zinc-500 font-semibold">{activePlan.length} stops</span>
                </div>
                
                <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                  {activePlan.map((place, idx) => (
                    <div
                      key={place.placeId}
                      className="flex items-center justify-between p-3 border border-zinc-900 bg-zinc-950/40 rounded-xl hover:border-zinc-800 transition-all group"
                    >
                      <div
                        onClick={() => {
                          setLocationQuery({ lat: place.lat, lng: place.lng, formattedAddress: place.name });
                          // Automatically toggle to map tab on phone view
                          setActiveMobileTab("map");
                        }}
                        className="flex items-center gap-2 cursor-pointer flex-1"
                      >
                        <span className="text-xs font-bold text-violet-400 w-5 h-5 rounded-full bg-violet-600/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-zinc-200 line-clamp-1 group-hover:text-violet-400 transition-all">
                            {place.name}
                          </span>
                          <span className="text-[9px] text-zinc-500">{place.category}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromPlan(place.placeId)}
                        className="text-[10px] font-bold text-zinc-550 hover:text-rose-400 px-2 py-1 transition-all"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <ChatPanel />
          </div>
        </aside>

        {/* Right Side Panel: Interactive Map */}
        <main className={`w-full h-[calc(100vh-48px)] lg:h-screen bg-zinc-900 relative flex flex-col ${
          activeMobileTab === "map" ? "flex" : "hidden lg:flex"
        }`}>
          {!MAPS_API_KEY && (
            <div className="absolute top-4 left-4 right-4 z-10 bg-amber-500/10 border border-amber-500/30 text-amber-300 px-4 py-3 rounded-2xl text-xs font-medium shadow-lg backdrop-blur">
              ⚠️ Google Maps API Key is missing. Please add <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to your <code>.env.local</code> file to load the map interface.
            </div>
          )}
          <div className="w-full h-full p-4 lg:p-6 bg-zinc-950">
            <MapCanvas />
          </div>
        </main>

        {/* Floating Chat Trigger */}
        <ChatBubbleButton />
      </div>
    </APIProvider>
  );
}
