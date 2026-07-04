"use client";

import React, { useEffect, useState } from "react";
import { Map, Marker, InfoWindow, useMap } from "@vis.gl/react-google-maps";
import { useAppStore } from "../../lib/store/useAppStore";

const DEFAULT_CENTER = { lat: 22.7196, lng: 75.8577 }; // Indore, India
const DEFAULT_ZOOM = 13;

function MapController() {
  const map = useMap();
  const { searchMode, locationQuery, pathQuery } = useAppStore();

  useEffect(() => {
    if (!map) return;

    if (searchMode === "location" && locationQuery) {
      map.panTo({ lat: locationQuery.lat, lng: locationQuery.lng });
      map.setZoom(14);
    } else if (searchMode === "path" && pathQuery) {
      const bounds = new google.maps.LatLngBounds();
      bounds.extend({ lat: pathQuery.origin.lat, lng: pathQuery.origin.lng });
      bounds.extend({ lat: pathQuery.destination.lat, lng: pathQuery.destination.lng });
      map.fitBounds(bounds);
      
      const listener = google.maps.event.addListener(map, "bounds_changed", () => {
        if (map.getZoom()! > 15) map.setZoom(15);
        google.maps.event.removeListener(listener);
      });
    } else {
      map.panTo(DEFAULT_CENTER);
      map.setZoom(DEFAULT_ZOOM);
    }
  }, [map, searchMode, locationQuery, pathQuery]);

  return null;
}

export default function MapCanvas() {
  const {
    searchMode,
    locationQuery,
    pathQuery,
    recommendations,
    personaScores,
    activePlan,
    addToPlan,
  } = useAppStore();

  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

  const selectedPlace = recommendations.find((r) => r.placeId === selectedPlaceId);

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden border border-zinc-800 shadow-lg">
      <Map
        defaultCenter={DEFAULT_CENTER}
        defaultZoom={DEFAULT_ZOOM}
        gestureHandling="cooperative"
        disableDefaultUI={false}
        styles={[
          { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
          { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
          { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
          {
            featureType: "administrative.locality",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d59563" }],
          },
          {
            featureType: "poi",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d59563" }],
          },
          {
            featureType: "poi.park",
            elementType: "geometry",
            stylers: [{ color: "#263c3f" }],
          },
          {
            featureType: "poi.park",
            elementType: "labels.text.fill",
            stylers: [{ color: "#6b9a76" }],
          },
          {
            featureType: "road",
            elementType: "geometry",
            stylers: [{ color: "#38414e" }],
          },
          {
            featureType: "road",
            elementType: "geometry.stroke",
            stylers: [{ color: "#212a37" }],
          },
          {
            featureType: "road",
            elementType: "labels.text.fill",
            stylers: [{ color: "#9ca5b3" }],
          },
          {
            featureType: "road.highway",
            elementType: "geometry",
            stylers: [{ color: "#746855" }],
          },
          {
            featureType: "road.highway",
            elementType: "geometry.stroke",
            stylers: [{ color: "#1f2835" }],
          },
          {
            featureType: "road.highway",
            elementType: "labels.text.fill",
            stylers: [{ color: "#f3d19c" }],
          },
          {
            featureType: "transit",
            elementType: "geometry",
            stylers: [{ color: "#2f3948" }],
          },
          {
            featureType: "transit.station",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d59563" }],
          },
          {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#17263c" }],
          },
          {
            featureType: "water",
            elementType: "labels.text.fill",
            stylers: [{ color: "#515c6d" }],
          },
          {
            featureType: "water",
            elementType: "labels.text.stroke",
            stylers: [{ color: "#17263c" }],
          },
        ]}
      >
        <MapController />

        {/* Location mode pin */}
        {searchMode === "location" && locationQuery && (
          <Marker
            position={{ lat: locationQuery.lat, lng: locationQuery.lng }}
            title={locationQuery.formattedAddress}
          />
        )}

        {/* Path mode pins */}
        {searchMode === "path" && pathQuery && (
          <>
            <Marker
              position={{ lat: pathQuery.origin.lat, lng: pathQuery.origin.lng }}
              title={pathQuery.origin.formattedAddress}
              label="A"
            />
            <Marker
              position={{ lat: pathQuery.destination.lat, lng: pathQuery.destination.lng }}
              title={pathQuery.destination.formattedAddress}
              label="B"
            />
          </>
        )}

        {/* Recommendation pin markers */}
        {recommendations.map((place) => {
          const isAdded = activePlan.some((p) => p.placeId === place.placeId);
          // Green dot for plan items, purple dot for scouted recommendations
          const pinUrl = isAdded
            ? "https://maps.google.com/mapfiles/ms/icons/green-dot.png"
            : "https://maps.google.com/mapfiles/ms/icons/purple-dot.png";

          return (
            <Marker
              key={place.placeId}
              position={{ lat: place.lat, lng: place.lng }}
              title={place.name}
              icon={pinUrl}
              onClick={() => setSelectedPlaceId(place.placeId)}
            />
          );
        })}

        {/* Info Window */}
        {selectedPlace && (
          <InfoWindow
            position={{ lat: selectedPlace.lat, lng: selectedPlace.lng }}
            onCloseClick={() => setSelectedPlaceId(null)}
          >
            <div className="p-2 text-zinc-900 min-w-[200px] flex flex-col gap-1">
              <div className="flex justify-between items-start gap-1">
                <h4 className="font-bold text-xs leading-tight pr-2">{selectedPlace.name}</h4>
                <span className="text-[9px] font-bold bg-violet-100 border border-violet-200 text-violet-700 px-1.5 py-0.5 rounded-full shrink-0">
                  {personaScores[selectedPlace.placeId]?.score ?? 80}% Match
                </span>
              </div>
              <p className="text-[10px] text-zinc-550 mt-0.5">{selectedPlace.category}</p>
              {selectedPlace.rating !== undefined && (
                <div className="flex items-center gap-1 text-[10px] text-zinc-600 mt-1">
                  <span className="text-amber-500 font-semibold">★ {selectedPlace.rating.toFixed(1)}</span>
                  {selectedPlace.reviewCount && <span>({selectedPlace.reviewCount} reviews)</span>}
                </div>
              )}
              <div className="flex justify-end gap-1.5 mt-2.5 border-t border-zinc-100 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    addToPlan(selectedPlace);
                    setSelectedPlaceId(null);
                  }}
                  disabled={activePlan.some((p) => p.placeId === selectedPlace.placeId)}
                  className="text-[9px] font-bold px-2.5 py-1.5 bg-violet-600 text-white rounded-lg hover:bg-violet-500 disabled:bg-zinc-200 disabled:text-zinc-400 disabled:cursor-not-allowed transition-all"
                >
                  {activePlan.some((p) => p.placeId === selectedPlace.placeId) ? "Added to Plan" : "Add to Plan"}
                </button>
              </div>
            </div>
          </InfoWindow>
        )}
      </Map>
    </div>
  );
}
