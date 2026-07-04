"use client";

import React from "react";
import { APIProvider } from "@vis.gl/react-google-maps";
import { useAppStore } from "../lib/store/useAppStore";
import { PersonaTag } from "../lib/types";

// UI Components
import PersonaPicker from "../components/onboarding/PersonaPicker";
import ModeToggle from "../components/search/ModeToggle";
import LocationSearchBox from "../components/search/LocationSearchBox";
import PathSearchBox from "../components/search/PathSearchBox";
import MapCanvas from "../components/map/MapCanvas";
import RecommendationsPanel from "../components/recommendations/RecommendationsPanel";
import ChatPanel from "../components/chat/ChatPanel";

const MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

const PERSONA_LABELS: Record<PersonaTag, string> = {
  heritage_temples: "🏛️ Heritage",
  nature_hiking: "⛰️ Nature",
  foodie: "🍔 Foodie",
  art_museums: "🎨 Art",
  nightlife_social: "🍻 Nightlife",
  family_friendly: "👨‍👩‍👧‍👦 Family",
  offbeat_hidden_gems: "💎 Offbeat",
};

export default function Home() {
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
      <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans antialiased p-4 sm:p-6 lg:p-8 flex flex-col gap-6 overflow-y-auto">
        {/* Onboarding View */}
        {!isOnboarded && <PersonaPicker />}

        <div className="max-w-7xl mx-auto w-full flex flex-col gap-6">
          {/* Top Brand Header Block */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-900/30 border border-zinc-900 rounded-3xl p-6 backdrop-blur">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-violet-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                WanderMind
              </h1>
              <p className="text-xs text-zinc-400 mt-1 font-medium">GenAI-Powered Experience Explorer & Route Planner</p>
            </div>
            
            {/* Interests & Vibe */}
            {isOnboarded && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mr-1">Vibe:</span>
                {persona.tags.map((tag) => (
                  <span
                    key={tag}
                    onClick={handleEditPersona}
                    className="text-xs font-semibold px-3 py-1.5 bg-violet-600/10 border border-violet-500/20 text-violet-400 rounded-xl cursor-pointer hover:bg-violet-600/20 hover:border-violet-500/40 transition-all"
                  >
                    {PERSONA_LABELS[tag] || tag}
                  </span>
                ))}
                {persona.freeText && (
                  <span
                    onClick={handleEditPersona}
                    className="text-xs font-semibold px-3 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-xl cursor-pointer hover:bg-zinc-800 line-clamp-1 max-w-[180px]"
                    title={persona.freeText}
                  >
                    📝 Custom
                  </span>
                )}
                <button
                  onClick={handleEditPersona}
                  className="text-xs font-bold px-3 py-1.5 bg-zinc-900/80 border border-zinc-850 rounded-xl hover:bg-zinc-800 hover:border-zinc-700 transition-all text-zinc-400 hover:text-zinc-200 ml-2"
                >
                  Edit Vibe
                </button>
              </div>
            )}
          </header>

          {/* Main Grid Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Destination Inputs & Chat (lg:col-span-5) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              {/* Destination Search Box */}
              <div className="bg-zinc-900/20 border border-zinc-900 rounded-3xl p-6 flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Search Mode</span>
                  <ModeToggle />
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Destination Inputs</span>
                  {searchMode === "location" ? <LocationSearchBox /> : <PathSearchBox />}
                </div>
              </div>

              {/* Chat Panel */}
              <ChatPanel />
            </div>

            {/* Right Column: Recommendations & Travel Plan Itinerary (lg:col-span-7) */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              {/* Recommendations Card */}
              <div className="bg-zinc-900/20 border border-zinc-900 rounded-3xl p-6 flex flex-col gap-4">
                <RecommendationsPanel />
              </div>

              {/* Travel Plan Card */}
              {activePlan.length > 0 && (
                <div className="bg-zinc-900/20 border border-zinc-900 rounded-3xl p-6 flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">My Travel Plan</h3>
                    <span className="text-[10px] text-zinc-500 font-semibold">{activePlan.length} stops</span>
                  </div>
                  
                  <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                    {activePlan.map((place, idx) => (
                      <div
                        key={place.placeId}
                        className="flex items-center justify-between p-3.5 border border-zinc-900 bg-zinc-950/40 rounded-2xl hover:border-zinc-800 transition-all group"
                      >
                        <div
                          onClick={() => {
                            setLocationQuery({ lat: place.lat, lng: place.lng, formattedAddress: place.name });
                          }}
                          className="flex items-center gap-3 cursor-pointer flex-1"
                        >
                          <span className="text-xs font-bold text-violet-400 w-6 h-6 rounded-full bg-violet-600/10 border border-violet-500/20 flex items-center justify-center shrink-0">
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
                          className="text-[10px] font-bold text-zinc-550 hover:text-rose-400 px-3 py-1 transition-all"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Lower Map Visualizer Section */}
          <div className="w-full bg-zinc-900/10 border border-zinc-900 rounded-3xl p-4 lg:p-6 relative flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider px-2">Interactive Visualizer</h3>
              {locationQuery && (
                <span className="text-[10px] text-zinc-500 font-semibold px-2">Map center: {locationQuery.formattedAddress}</span>
              )}
            </div>
            
            <main className="w-full h-[400px] sm:h-[450px] lg:h-[500px] relative bg-zinc-950 rounded-2xl overflow-hidden">
              {!MAPS_API_KEY && (
                <div className="absolute top-4 left-4 right-4 z-10 bg-amber-500/10 border border-amber-500/30 text-amber-300 px-4 py-3 rounded-2xl text-xs font-medium shadow-lg backdrop-blur">
                  ⚠️ Google Maps API Key is missing. Please add <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to your <code>.env.local</code> file to load the map interface.
                </div>
              )}
              <MapCanvas />
            </main>
          </div>
        </div>
      </div>
    </APIProvider>
  );
}
