"use client";

import { useEffect, useRef } from "react";

export default function MapComponent({ locations = [] }) {
  const mapRef      = useRef(null);   // the leaflet map instance
  const containerRef = useRef(null);  // the DOM div
  const markersRef  = useRef([]);     // track markers so we can remove them

  /* ── initialise map once ── */
  useEffect(() => {
    if (mapRef.current) return;   // already initialised

    // leaflet is loaded in the browser — safe because this component
    // is always imported with ssr:false
    const L = require("leaflet");

    // Fix the broken default marker icon paths that Next.js asset pipeline breaks
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });

    // centre on Gainesville FL if no locations yet
    const defaultCenter = [29.6516, -82.3248];
    const defaultZoom   = 12;

    const map = L.map(containerRef.current, {
      center:    defaultCenter,
      zoom:      defaultZoom,
      zoomControl: false,          // we'll add it in a better position
    });

    // Tile layer — CartoDB Positron (clean, light, no API key needed)
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19,
      }
    ).addTo(map);

    // Custom zoom control — bottom right
    L.control.zoom({ position: "bottomright" }).addTo(map);

    mapRef.current = map;

    // cleanup on unmount
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  /* ── sync markers whenever locations prop changes ── */
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const L = require("leaflet");

    // remove all existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Filter out any entries missing valid coordinates
    const validLocations = locations.filter(
      (l) => typeof l.lat === "number" && typeof l.lng === "number" && !isNaN(l.lat) && !isNaN(l.lng)
    );

    if (validLocations.length === 0) return;

    // custom pin SVG — matches GatorGreen palette
    const makeIcon = (index) => {
      const hue   = (index * 47 + 140) % 360;
      const color = `hsl(${hue},70%,45%)`;
      const glow  = `hsl(${hue},70%,65%)`;
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="38" viewBox="0 0 28 38">
          <defs>
            <radialGradient id="g${index}" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stop-color="${glow}"/>
              <stop offset="100%" stop-color="${color}"/>
            </radialGradient>
            <filter id="shadow${index}">
              <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="${color}" flood-opacity="0.5"/>
            </filter>
          </defs>
          <path d="M14 1 C7.4 1 2 6.4 2 13 C2 22 14 37 14 37 C14 37 26 22 26 13 C26 6.4 20.6 1 14 1 Z"
            fill="url(#g${index})" filter="url(#shadow${index})"/>
          <circle cx="14" cy="13" r="5" fill="white" opacity="0.9"/>
          <circle cx="11.5" cy="10.5" r="1.8" fill="white" opacity="0.35"/>
        </svg>`;
      return L.divIcon({
        html:      svg,
        className: "",             // override leaflet's default white box
        iconSize:  [28, 38],
        iconAnchor:[14, 38],       // tip of pin
        popupAnchor:[0, -38],
      });
    };

    const newMarkers = validLocations.map((loc, i) => {
      const marker = L.marker([loc.lat, loc.lng], { icon: makeIcon(i) })
        .addTo(map)
        .bindPopup(
          `<div style="font-family:system-ui,sans-serif;min-width:140px;">
            <div style="font-weight:700;font-size:13px;color:#14532d;margin-bottom:4px;">${loc.name}</div>
            <div style="font-size:11px;color:#6b7280;font-family:monospace;">${loc.lat.toFixed(5)}, ${loc.lng.toFixed(5)}</div>
          </div>`,
          { maxWidth: 240, className: "gg-popup" }
        );
      return marker;
    });

    markersRef.current = newMarkers;

    if (validLocations.length === 1) {
      map.setView([validLocations[0].lat, validLocations[0].lng], 14, { animate: true });
    } else {
      const bounds = L.latLngBounds(validLocations.map((l) => [l.lat, l.lng]));
      map.fitBounds(bounds, { padding: [48, 48], animate: true, maxZoom: 15 });
    }
  }, [locations]);

  return (
    <>
      <style>{`
        /* popup card styling */
        .gg-popup .leaflet-popup-content-wrapper {
          border-radius: 10px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          border: 1px solid #dcfce7;
          padding: 0;
        }
        .gg-popup .leaflet-popup-content {
          margin: 12px 14px;
        }
        .gg-popup .leaflet-popup-tip {
          background: white;
        }
        /* attribution tiny */
        .leaflet-control-attribution {
          font-size: 9px !important;
          background: rgba(255,255,255,0.7) !important;
          padding: 2px 6px !important;
          border-radius: 4px 0 0 0 !important;
        }
        /* zoom buttons */
        .leaflet-control-zoom a {
          border-radius: 8px !important;
          border: 1px solid #e5e7eb !important;
          color: #166534 !important;
          font-weight: 700 !important;
        }
        .leaflet-control-zoom a:hover {
          background: #f0fdf4 !important;
        }
        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 2px 12px rgba(0,0,0,0.12) !important;
          display: flex !important;
          flex-direction: column !important;
          gap: 4px !important;
          margin-bottom: 20px !important;
          margin-right: 16px !important;
        }
      `}</style>
      <div
        ref={containerRef}
        style={{ width: "100%", height: "100%" }}
      />
    </>
  );
}