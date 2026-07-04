import React from "react";

export default function AgentsAtWorkStrip() {
  return (
    <div className="flex gap-2 p-2 border-y bg-slate-50 text-xs text-slate-500 font-medium items-center">
      <span>Agents trace:</span>
      <span className="animate-pulse">Waiting for action...</span>
    </div>
  );
}
