"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import React, { useEffect, useRef, useState } from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { useAppStore } from "../../lib/store/useAppStore";

interface LocationData {
  lat: number;
  lng: number;
  formattedAddress: string;
}

export default function PathSearchBox() {
  const originInputRef = useRef<HTMLInputElement>(null);
  const destInputRef = useRef<HTMLInputElement>(null);
  const placesLib = useMapsLibrary("places");
  const { pathQuery, setPathQuery, dispatchSearch } = useAppStore();

  const [originVal, setOriginVal] = useState(pathQuery?.origin?.formattedAddress || "");
  const [destVal, setDestVal] = useState(pathQuery?.destination?.formattedAddress || "");

  const [originData, setOriginData] = useState<LocationData | null>(pathQuery?.origin || null);
  const [destData, setDestData] = useState<LocationData | null>(pathQuery?.destination || null);

  const originDataRef = useRef<LocationData | null>(null);
  const destDataRef = useRef<LocationData | null>(null);

  useEffect(() => {
    originDataRef.current = originData;
  }, [originData]);

  useEffect(() => {
    destDataRef.current = destData;
  }, [destData]);

  // Sync with global store changes
  useEffect(() => {
    if (pathQuery) {
      setOriginVal(pathQuery.origin.formattedAddress);
      setOriginData(pathQuery.origin);
      setDestVal(pathQuery.destination.formattedAddress);
      setDestData(pathQuery.destination);
    } else {
      setOriginVal("");
      setOriginData(null);
      setDestVal("");
      setDestData(null);
    }
  }, [pathQuery]);

  useEffect(() => {
    if (!placesLib) return;

    let originAutocomplete: google.maps.places.Autocomplete | null = null;
    let destAutocomplete: google.maps.places.Autocomplete | null = null;

    if (originInputRef.current) {
      originAutocomplete = new placesLib.Autocomplete(originInputRef.current, {
        fields: ["geometry", "formatted_address", "name"],
      });

      originAutocomplete.addListener("place_changed", () => {
        const place = originAutocomplete!.getPlace();
        if (place.geometry?.location) {
          const data = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            formattedAddress: place.formatted_address || place.name || "",
          };
          setOriginData(data);
          setOriginVal(data.formattedAddress);
          if (destDataRef.current) dispatchSearch();
        }
      });
    }

    if (destInputRef.current) {
      destAutocomplete = new placesLib.Autocomplete(destInputRef.current, {
        fields: ["geometry", "formatted_address", "name"],
      });

      destAutocomplete.addListener("place_changed", () => {
        const place = destAutocomplete!.getPlace();
        if (place.geometry?.location) {
          const data = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            formattedAddress: place.formatted_address || place.name || "",
          };
          setDestData(data);
          setDestVal(data.formattedAddress);
          if (originDataRef.current) dispatchSearch();
        }
      });
    }

    return () => {
      if (originAutocomplete) google.maps.event.clearInstanceListeners(originAutocomplete);
      if (destAutocomplete) google.maps.event.clearInstanceListeners(destAutocomplete);
    };
  }, [placesLib, dispatchSearch]);

  // Sync to store when both origin and destination are selected
  useEffect(() => {
    if (originData && destData) {
      setPathQuery({
        origin: originData,
        destination: destData,
      });
    } else {
      setPathQuery(null);
    }
  }, [originData, destData, setPathQuery]);

  const handleClearOrigin = () => {
    setOriginData(null);
    setOriginVal("");
  };

  const handleClearDest = () => {
    setDestData(null);
    setDestVal("");
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Origin Input */}
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-500 text-xs">
          🟢
        </div>
        <input
          ref={originInputRef}
          type="text"
          placeholder="Starting point (origin)..."
          value={originVal}
          onChange={(e) => {
            const val = e.target.value;
            setOriginVal(val);
            setOriginData(val ? { lat: 0, lng: 0, formattedAddress: val } : null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && originVal.trim() && destVal.trim()) {
              e.preventDefault();
              dispatchSearch();
            }
          }}
          className="w-full pl-10 pr-10 py-3.5 bg-zinc-900 border border-zinc-800 rounded-2xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all shadow-inner"
        />
        {originVal && (
          <button
            type="button"
            onClick={handleClearOrigin}
            className="absolute inset-y-0 right-4 flex items-center text-zinc-500 hover:text-zinc-300 text-xs font-bold"
          >
            ✕
          </button>
        )}
      </div>

      {/* Destination Input */}
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-500 text-xs">
          🔴
        </div>
        <input
          ref={destInputRef}
          type="text"
          placeholder="End point (destination)..."
          value={destVal}
          onChange={(e) => {
            const val = e.target.value;
            setDestVal(val);
            setDestData(val ? { lat: 0, lng: 0, formattedAddress: val } : null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && originVal.trim() && destVal.trim()) {
              e.preventDefault();
              dispatchSearch();
            }
          }}
          className="w-full pl-10 pr-10 py-3.5 bg-zinc-900 border border-zinc-800 rounded-2xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all shadow-inner"
        />
        {destVal && (
          <button
            type="button"
            onClick={handleClearDest}
            className="absolute inset-y-0 right-4 flex items-center text-zinc-500 hover:text-zinc-300 text-xs font-bold"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
