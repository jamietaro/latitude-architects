"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const OFFICE: [number, number] = [-0.096545, 51.501761];

export default function MapBox() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token || !containerRef.current || mapRef.current) return;

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: OFFICE,
      zoom: 13,
      scrollZoom: false,
    });
    mapRef.current = map;

    const markerEl = document.createElement("img");
    markerEl.src = "/favicon.svg";
    markerEl.alt = "Latitude Architects";
    markerEl.width = 32;
    markerEl.height = 32;
    markerEl.style.display = "block";

    new mapboxgl.Marker({ element: markerEl, anchor: "center" })
      .setLngLat(OFFICE)
      .addTo(map);

    map.on("load", () => {
      map.addControl(new mapboxgl.NavigationControl(), "top-right");
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%" }}
      aria-label="Map showing Latitude Architects office"
    />
  );
}
