import React from "react";

export default function PathSearchBox() {
  return (
    <div className="flex flex-col gap-2 max-w-md w-full">
      <input type="text" placeholder="From (origin)..." className="px-3 py-2 border rounded" readOnly />
      <input type="text" placeholder="To (destination)..." className="px-3 py-2 border rounded" readOnly />
    </div>
  );
}
