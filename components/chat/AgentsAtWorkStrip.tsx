"use client";

import React from "react";
import { useAppStore } from "../../lib/store/useAppStore";

export default function AgentsAtWorkStrip() {
  const { uiStatus, statusMessage } = useAppStore();

  if (uiStatus !== "loading") return null;

  return (
    <div className="flex items-center gap-2.5 px-4 py-3 border-t border-zinc-900 bg-zinc-900/30 text-xs font-semibold text-violet-400 transition-all animate-pulse">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
      </span>
      <span>{statusMessage || "Agents analyzing request..."}</span>
    </div>
  );
}
