"use client";

import { useMap } from "react-leaflet";
import { useEffect } from "react";

export default function MapController({ position }: { position: { lat: number; lng: number } }) {
    const map = useMap();

    useEffect(() => {
        map.flyTo([position.lat, position.lng], 3);
    }, [position, map]);

    return null;
}
