import React from "react";

export default function ModeToggle() {
  return (
    <div className="flex border rounded overflow-hidden w-fit">
      <button className="px-3 py-1 bg-slate-200 font-medium text-sm">Location</button>
      <button className="px-3 py-1 text-sm">Path</button>
    </div>
  );
}
