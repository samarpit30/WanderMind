"use client";

import React, { useState } from "react";
import { useAppStore } from "../../lib/store/useAppStore";
import { PersonaTag, UserPersona } from "../../lib/types";

interface PersonaConfig {
  id: PersonaTag;
  label: string;
  description: string;
  icon: string;
}

const AVAILABLE_PERSONAS: PersonaConfig[] = [
  { id: "heritage_temples", label: "Heritage & Temples", description: "Historical sites, local temples, and monuments", icon: "🏛️" },
  { id: "nature_hiking", label: "Nature & Hiking", description: "Parks, trails, lakes, and scenic viewpoints", icon: "⛰️" },
  { id: "foodie", label: "Foodie & Street Food", description: "Local delicacies, night food markets, and cafes", icon: "🍔" },
  { id: "art_museums", label: "Art & Museums", description: "Galleries, historical museums, and exhibits", icon: "🎨" },
  { id: "nightlife_social", label: "Nightlife & Social", description: "Bars, social clubs, and active night life", icon: "🍻" },
  { id: "family_friendly", label: "Family-Friendly", description: "Safe, interactive spots suitable for all ages", icon: "👨‍👩‍👧‍👦" },
  { id: "offbeat_hidden_gems", label: "Offbeat & Hidden Gems", description: "Secret spots and off-the-beaten-path locations", icon: "💎" },
];

export default function PersonaPicker() {
  const { setPersona, setIsOnboarded } = useAppStore();
  const [selectedTags, setSelectedTags] = useState<PersonaTag[]>([]);
  const [freeText, setFreeText] = useState("");

  const handleToggleTag = (tagId: PersonaTag) => {
    setSelectedTags((prev) => {
      if (prev.includes(tagId)) {
        return prev.filter((id) => id !== tagId);
      }
      if (prev.length >= 3) {
        return prev; // Enforce max 3 tags limit
      }
      return [...prev, tagId];
    });
  };

  const handleStartExploring = () => {
    if (selectedTags.length === 0) return;
    const persona: UserPersona = {
      tags: selectedTags,
      freeText: freeText.trim() ? freeText.trim() : undefined,
    };
    setPersona(persona);
    setIsOnboarded(true);
  };

  const handleSkip = () => {
    // Sane default: Offbeat/Hidden Gems + Foodie
    const persona: UserPersona = {
      tags: ["offbeat_hidden_gems", "foodie"],
    };
    setPersona(persona);
    setIsOnboarded(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-xl w-full p-8 shadow-2xl flex flex-col gap-6 text-white max-h-[90vh] overflow-y-auto">
        <div className="text-center flex flex-col gap-2">
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
            Customize Your Mind
          </h2>
          <p className="text-zinc-400 text-sm">
            Select 1 to 3 categories that define your travel style. We will curate and score every recommendation for you.
          </p>
        </div>

        {/* Persona Tags Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {AVAILABLE_PERSONAS.map((persona) => {
            const isSelected = selectedTags.includes(persona.id);
            const isMaxReached = selectedTags.length >= 3;
            const disabled = !isSelected && isMaxReached;

            return (
              <button
                key={persona.id}
                type="button"
                onClick={() => handleToggleTag(persona.id)}
                disabled={disabled}
                className={`flex gap-3 items-center text-left p-3.5 rounded-2xl border transition-all ${
                  isSelected
                    ? "bg-violet-600/20 border-violet-500 ring-2 ring-violet-500/50"
                    : disabled
                    ? "opacity-40 bg-zinc-900/20 border-zinc-800 cursor-not-allowed"
                    : "bg-zinc-900/50 border-zinc-800/80 hover:bg-zinc-900 hover:border-zinc-700"
                }`}
              >
                <span className="text-2xl">{persona.icon}</span>
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold text-sm text-zinc-100">{persona.label}</span>
                  <span className="text-xs text-zinc-500 line-clamp-1">{persona.description}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Free Text Input */}
        <div className="flex flex-col gap-2">
          <label htmlFor="free-text-interests" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            In your own words (Optional)
          </label>
          <textarea
            id="free-text-interests"
            rows={2}
            placeholder="e.g., I love historical architectures, specialty coffee roasters, and avoiding crowded spots."
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
            className="w-full bg-zinc-900/50 border border-zinc-850 rounded-2xl p-4 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all resize-none"
          />
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={handleSkip}
            className="flex-1 px-5 py-3.5 bg-zinc-900 border border-zinc-850 hover:bg-zinc-850 text-zinc-300 font-semibold rounded-2xl transition-all text-sm"
          >
            Skip & Use Defaults
          </button>
          <button
            type="button"
            onClick={handleStartExploring}
            disabled={selectedTags.length === 0}
            className={`flex-1 px-5 py-3.5 font-semibold rounded-2xl transition-all text-sm ${
              selectedTags.length > 0
                ? "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/30"
                : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
            }`}
          >
            Start Exploring
          </button>
        </div>
      </div>
    </div>
  );
}
