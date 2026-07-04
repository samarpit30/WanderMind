import React from "react";

export default function ItineraryTimeline() {
  return (
    <div className="flex flex-col gap-2 p-2 bg-slate-50 border rounded text-sm text-slate-600">
      <span>Timeline start</span>
      <div className="pl-4 border-l-2 py-1">Activity 1</div>
      <div className="pl-4 border-l-2 py-1">Activity 2</div>
      <span>Timeline end</span>
    </div>
  );
}
