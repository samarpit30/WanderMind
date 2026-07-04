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
  const { isOnboarded, setIsOnboarded, searchMode, persona } = useAppStore();

  const handleEditPersona = () => {
    setIsOnboarded(false);
  };

  return (
    <APIProvider apiKey={MAPS_API_KEY} libraries={["places"]}>
      <div className="flex flex-col lg:flex-row min-h-screen bg-zinc-950 text-zinc-100 font-sans antialiased overflow-hidden">
        {/* Onboarding View */}
        {!isOnboarded && <PersonaPicker />}

        {/* Left Side Panel: Search Controls, Chat, and Recommendations */}
        <aside className="w-full lg:w-[420px] lg:h-screen shrink-0 border-b lg:border-b-0 lg:border-r border-zinc-900 bg-zinc-950/80 backdrop-blur flex flex-col overflow-y-auto">
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
            <ChatPanel />
          </div>
        </aside>

        {/* Right Side Panel: Interactive Map */}
        <main className="flex-1 flex flex-col lg:h-screen bg-zinc-900 relative">
          {!MAPS_API_KEY && (
            <div className="absolute top-4 left-4 right-4 z-10 bg-amber-500/10 border border-amber-500/30 text-amber-300 px-4 py-3 rounded-2xl text-xs font-medium shadow-lg backdrop-blur">
              ⚠️ Google Maps API Key is missing. Please add <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to your <code>.env.local</code> file to load the map interface.
            </div>
          )}
          <div className="flex-1 h-[60vh] lg:h-full p-4 lg:p-6 bg-zinc-950">
            <MapCanvas />
          </div>
        </main>

        {/* Floating Chat Trigger */}
        <ChatBubbleButton />
      </div>
    </APIProvider>
  );
}
