"use client";

import React from "react";
import { useAppStore } from "../../lib/store/useAppStore";
import RecommendationCard from "./RecommendationCard";

export default function RecommendationsPanel() {
  const { recommendations, personaScores, uiStatus } = useAppStore();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Scouted Experiences</h3>
        {recommendations.length > 0 && (
          <span className="text-[10px] text-zinc-500 font-semibold">{recommendations.length} found</span>
        )}
      </div>

      {/* Loading Skeleton State */}
      {uiStatus === "loading" && recommendations.length === 0 ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex gap-4 p-4 border border-zinc-900 bg-zinc-950/20 rounded-2xl animate-pulse"
            >
              <div className="w-20 h-20 bg-zinc-900 rounded-xl shrink-0" />
              <div className="flex-1 flex flex-col justify-between py-1">
                <div className="flex flex-col gap-2">
                  <div className="h-4 bg-zinc-900 rounded w-2/3" />
                  <div className="h-3 bg-zinc-900 rounded w-1/3" />
                </div>
                <div className="h-3 bg-zinc-900 rounded w-1/2 mt-3" />
              </div>
            </div>
          ))}
        </div>
      ) : recommendations.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center text-center p-6 border border-dashed border-zinc-900 rounded-2xl bg-zinc-950/20 min-h-[140px]">
          <span className="text-2xl mb-1.5 opacity-60">🗺️</span>
          <p className="text-xs font-bold text-zinc-550">No recommendations yet</p>
          <p className="text-[10px] text-zinc-600 max-w-[240px] mt-1">
            Search a destination or ask the AI agent to scout interesting locations nearby.
          </p>
        </div>
      ) : (
        /* Recommendations List */
        <div className="flex flex-col gap-3 max-h-[420px] overflow-y-auto pr-1 scrollbar-thin">
          {recommendations.map((place) => (
            <RecommendationCard
              key={place.placeId}
              place={place}
              score={personaScores[place.placeId]}
            />
          ))}
        </div>
      )}
    </div>
  );
}
