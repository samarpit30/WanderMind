"use client";

/* eslint-disable @next/next/no-img-element */

import React from "react";
import { Place, PersonaScore } from "../../lib/types";
import { useAppStore } from "../../lib/store/useAppStore";

interface RecommendationCardProps {
  place: Place;
  score?: PersonaScore;
}

export default function RecommendationCard({ place, score }: RecommendationCardProps) {
  const { addToPlan, activePlan } = useAppStore();
  const isAdded = activePlan.some((p) => p.placeId === place.placeId);

  const scoreVal = score?.score ?? 80;
  
  // Score color bands
  const scoreColor = 
    scoreVal >= 80 
      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
      : scoreVal >= 50 
      ? "bg-amber-500/10 border-amber-500/20 text-amber-400" 
      : "bg-zinc-800 border-zinc-700 text-zinc-400";

  return (
    <div className="flex gap-4 p-4 border border-zinc-900 bg-zinc-950/40 hover:bg-zinc-900/50 hover:border-zinc-800 rounded-2xl transition-all shadow-sm">
      {/* Photo */}
      {place.photoUrl ? (
        <img
          src={place.photoUrl}
          alt={place.name}
          className="w-20 h-20 rounded-xl object-cover border border-zinc-900 shrink-0"
        />
      ) : (
        <div className="w-20 h-20 rounded-xl bg-zinc-900 border border-zinc-850 flex items-center justify-center shrink-0 text-2xl">
          📍
        </div>
      )}

      {/* Info */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start gap-2">
            <h4 className="font-bold text-sm text-zinc-100 line-clamp-1">{place.name}</h4>
            <span className={`text-[10px] font-semibold px-2 py-0.5 border rounded-full shrink-0 ${scoreColor}`}>
              {scoreVal}% Match
            </span>
          </div>

          <div className="flex items-center gap-2 mt-1 text-xs text-zinc-550">
            <span>{place.category}</span>
            {place.rating !== undefined && (
              <span className="flex items-center gap-0.5 text-amber-400 font-medium">
                ★ {place.rating.toFixed(1)}
              </span>
            )}
          </div>
        </div>

        {/* Action */}
        <div className="flex justify-between items-center mt-3 pt-2 border-t border-zinc-900/40">
          <span className="text-[10px] font-medium text-zinc-500 line-clamp-1 max-w-[150px]">
            {place.openingHoursToday ? `🕒 ${place.openingHoursToday}` : "🕒 Hours unavailable"}
          </span>
          <button
            type="button"
            onClick={() => addToPlan(place)}
            disabled={isAdded}
            className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all ${
              isAdded
                ? "bg-zinc-900 border border-zinc-850 text-zinc-500 cursor-not-allowed"
                : "bg-violet-600 hover:bg-violet-500 text-white shadow-sm hover:scale-[1.02]"
            }`}
          >
            {isAdded ? "Added" : "＋ Add to Plan"}
          </button>
        </div>
      </div>
    </div>
  );
}
