import React from "react";

export default function LocationSearchBox() {
  return (
    <input
      type="text"
      placeholder="Search a location..."
      className="px-3 py-2 border rounded w-full max-w-md"
      readOnly
    />
  );
}
