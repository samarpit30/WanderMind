"use client";

import React, { useEffect } from "react";
import { Map, Marker, useMap } from "@vis.gl/react-google-maps";
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
      
      // Prevent zooming in too close if the pins are at the exact same location
      const listener = google.maps.event.addListener(map, "bounds_changed", () => {
        if (map.getZoom()! > 15) map.setZoom(15);
        google.maps.event.removeListener(listener);
      });
    } else {
      // Default reset
      map.panTo(DEFAULT_CENTER);
      map.setZoom(DEFAULT_ZOOM);
    }
  }, [map, searchMode, locationQuery, pathQuery]);

  return null;
}

export default function MapCanvas() {
  const { searchMode, locationQuery, pathQuery } = useAppStore();

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden border border-zinc-800 shadow-lg">
      <Map
        defaultCenter={DEFAULT_CENTER}
        defaultZoom={DEFAULT_ZOOM}
        gestureHandling="cooperative"
        disableDefaultUI={false}
        // Apply custom map style (sleek dark mode style for maps)
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
      </Map>
    </div>
  );
}
