"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { Developer } from "@/lib/api";
import type * as L from "leaflet";

interface DeveloperWithDistance extends Developer {
  distance: number;
}

interface DeveloperMapProps {
  userLocation: {
    latitude: number;
    longitude: number;
  };
  developers: DeveloperWithDistance[];
  searchRadius?: number;
}

export default function DeveloperMap({
  userLocation,
  developers,
  searchRadius = 10,
}: DeveloperMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const circleRef = useRef<L.Circle | null>(null);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const initMap = async () => {
      if (!userLocation) return;

      const L = await import("leaflet");
      leafletRef.current = L;

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "/leaflet/marker-icon-2x.png",
        iconUrl: "/leaflet/marker-icon.png",
        shadowUrl: "/leaflet/marker-shadow.png",
      });

      if (cancelled) return;

      if (mapRef.current && !mapInstanceRef.current) {
        mapInstanceRef.current = L.map(mapRef.current).setView(
          [userLocation.latitude, userLocation.longitude],
          13
        );

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(mapInstanceRef.current);

        setIsMapReady(true);
      }
    };

    initMap();

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [userLocation]);

  useEffect(() => {
    if (
      !mapInstanceRef.current ||
      !leafletRef.current ||
      !isMapReady ||
      !userLocation
    ) {
      return;
    }

    const L = leafletRef.current;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    if (circleRef.current) {
      circleRef.current.remove();
    }

    circleRef.current = L.circle(
      [userLocation.latitude, userLocation.longitude],
      {
        radius: searchRadius * 1000,
        color: "#7c3aed",
        fillColor: "#7c3aed",
        fillOpacity: 0.05,
        weight: 2,
      }
    ).addTo(mapInstanceRef.current);

    const userIcon = L.divIcon({
      html: `<div class="w-6 h-6 rounded-full bg-purple-600 border-2 border-white flex items-center justify-center text-white text-xs font-bold">Eu</div>`,
      className: "user-marker",
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    const userMarker = L.marker(
      [userLocation.latitude, userLocation.longitude],
      {
        icon: userIcon,
      }
    )
      .addTo(mapInstanceRef.current)
      .bindPopup("Sua localização");

    markersRef.current.push(userMarker);

    developers.forEach((dev) => {
      const devIcon = L.divIcon({
        html: `<div class="w-8 h-8 rounded-full bg-white border-2 border-purple-600 flex items-center justify-center overflow-hidden">
          <img src="${
            dev.avatarUrl || "/placeholder.svg?height=32&width=32"
          }" alt="${
          dev.name
        }" class="w-full h-full object-cover rounded-full" onerror="this.src='/placeholder.svg?height=32&width=32'" />
          </div>`,
        className: "dev-marker",
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([dev.latitude, dev.longitude], {
        icon: devIcon,
      }).addTo(mapInstanceRef.current!).bindPopup(`
          <div class="text-center p-2">
            <div class="font-bold text-lg">${dev.name}</div>
            ${
              dev.bio
                ? `<div class="text-sm text-gray-600 mb-2">${dev.bio}</div>`
                : ""
            }
            ${
              dev.distance
                ? `<div class="text-xs text-gray-500 mb-2">${dev.distance.toFixed(
                    1
                  )}km de distância</div>`
                : ""
            }
            <a href="https://github.com/${
              dev.githubUsername
            }" target="_blank" class="text-xs text-purple-600 hover:text-purple-800">
              Ver no GitHub
            </a>
          </div>
        `);

      markersRef.current.push(marker);
    });

    if (markersRef.current.length > 1) {
      const group = L.featureGroup([
        ...markersRef.current,
        ...(circleRef.current ? [circleRef.current] : []),
      ]);
      mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
    } else {
      const zoom =
        searchRadius <= 5
          ? 14
          : searchRadius <= 10
          ? 13
          : searchRadius <= 20
          ? 12
          : 11;
      mapInstanceRef.current.setView(
        [userLocation.latitude, userLocation.longitude],
        zoom
      );
    }
  }, [userLocation, developers, searchRadius, isMapReady]);

  return (
    <div className="relative h-full w-full">
      <div ref={mapRef} className="h-full w-full" />
      {!isMapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin mb-2" />
            <p>Carregando mapa...</p>
          </div>
        </div>
      )}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md">
        <div className="text-sm font-medium text-gray-700">
          Raio: {searchRadius}km
        </div>
      </div>
    </div>
  );
}
