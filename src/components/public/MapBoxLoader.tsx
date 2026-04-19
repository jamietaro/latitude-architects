"use client";

import dynamic from "next/dynamic";

const MapBox = dynamic(() => import("./MapBox"), { ssr: false });

export default function MapBoxLoader() {
  return <MapBox />;
}
