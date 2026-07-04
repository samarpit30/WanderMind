"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import React, { useEffect, useRef, useState } from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { useAppStore } from "../../lib/store/useAppStore";

export default function LocationSearchBox() {
  const inputRef = useRef<HTMLInputElement>(null);
  const placesLib = useMapsLibrary("places");
  const { locationQuery, setLocationQuery } = useAppStore();
  const [inputValue, setInputValue] = useState(locationQuery?.formattedAddress || "");

  // Update input text if locationQuery changes globally
  useEffect(() => {
    setInputValue(locationQuery?.formattedAddress || "");
  }, [locationQuery]);

  useEffect(() => {
    if (!placesLib || !inputRef.current) return;

    const autocomplete = new placesLib.Autocomplete(inputRef.current, {
      fields: ["geometry", "formatted_address", "name"],
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (place.geometry?.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const formattedAddress = place.formatted_address || place.name || "";
        
        setLocationQuery({ lat, lng, formattedAddress });
        setInputValue(formattedAddress);
      }
    });

    // Clean up autocomplete listeners if needed (Autocomplete doesn't have an explicit destroy, but we can clear listeners)
    return () => {
      google.maps.event.clearInstanceListeners(autocomplete);
    };
  }, [placesLib, setLocationQuery]);

  const handleClear = () => {
    setLocationQuery(null);
    setInputValue("");
  };

  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-500">
        🔍
      </div>
      <input
        ref={inputRef}
        type="text"
        placeholder="Enter a city or location to scout..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="w-full pl-10 pr-10 py-3.5 bg-zinc-900 border border-zinc-800 rounded-2xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all shadow-inner"
      />
      {inputValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute inset-y-0 right-4 flex items-center text-zinc-500 hover:text-zinc-300 text-xs font-bold"
        >
          ✕
        </button>
      )}
    </div>
  );
}
