"use client";

import React from "react";
import { useAppStore } from "../../lib/store/useAppStore";

export default function ModeToggle() {
  const { searchMode, setSearchMode } = useAppStore();

  return (
    <div className="flex bg-zinc-900 border border-zinc-800 p-1 rounded-2xl w-full">
      <button
        type="button"
        onClick={() => setSearchMode("location")}
        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
          searchMode === "location"
            ? "bg-zinc-800 text-white shadow-sm"
            : "text-zinc-400 hover:text-zinc-200"
        }`}
      >
        <span>📍</span>
        Single Location
      </button>
      <button
        type="button"
        onClick={() => setSearchMode("path")}
        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
          searchMode === "path"
            ? "bg-zinc-800 text-white shadow-sm"
            : "text-zinc-400 hover:text-zinc-200"
        }`}
      >
        <span>🧭</span>
        Route Path
      </button>
    </div>
  );
}
