"use client";

/**
 * LocationMap — interactive Leaflet map (OpenStreetMap tiles, zero API key).
 * Editable mode: click / drag the pin to set the worker's exact location.
 * View mode (editable=false): read-only mini-map showing a saved location.
 * Leaflet is loaded via dynamic import (SSR-safe); the pin is a CSS divIcon
 * so no bundler icon-asset issues. Theme-aware via CSS variables.
 */

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import type { Map as LeafletMap, Marker as LeafletMarker } from "leaflet";

interface LocationMapProps {
  lat: number | null;
  lng: number | null;
  onChange?: (lat: number, lng: number) => void;
  editable?: boolean;
  height?: number;
  locale?: string;
}

const PAKISTAN_CENTER: [number, number] = [30.3753, 69.3451];

const pinHtml = (color: string) =>
  `<div style="width:26px;height:26px;border-radius:50% 50% 50% 0;background:${color};transform:rotate(-45deg);border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.4)"><div style="width:8px;height:8px;background:#fff;border-radius:50%;margin:6px auto"></div></div>`;

export function LocationMap({
  lat,
  lng,
  onChange,
  editable = true,
  height = 260,
  locale = "en",
}: LocationMapProps) {
  const holderRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<LeafletMarker | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let disposed = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (disposed || !holderRef.current || mapRef.current) return;
      const start: [number, number] =
        lat != null && lng != null ? [lat, lng] : PAKISTAN_CENTER;
      const map = L.map(holderRef.current, {
        center: start,
        zoom: lat != null ? 14 : 5.2,
        scrollWheelZoom: editable,
        attributionControl: true,
      });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);
      mapRef.current = map;

      const icon = L.divIcon({
        html: pinHtml(editable ? "#0D7A5F" : "#D97706"),
        className: "rozgaar-map-pin",
        iconSize: [26, 26],
        iconAnchor: [13, 26],
      });

      const placeMarker = (p: [number, number]) => {
        if (markerRef.current) {
          markerRef.current.setLatLng(p);
        } else {
          markerRef.current = L.marker(p, { icon, draggable: editable }).addTo(map);
          if (editable) {
            markerRef.current.on("dragend", () => {
              const q = markerRef.current!.getLatLng();
              onChangeRef.current?.(q.lat, q.lng);
            });
          }
        }
      };

      if (lat != null && lng != null) placeMarker([lat, lng]);

      if (editable) {
        map.on("click", (e) => {
          placeMarker([e.latlng.lat, e.latlng.lng]);
          onChangeRef.current?.(e.latlng.lat, e.latlng.lng);
        });
      }
      setReady(true);
      // fix tile sizing after paint
      setTimeout(() => map.invalidateSize(), 150);
    })();
    return () => {
      disposed = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // follow external lat/lng changes (e.g. GPS button)
  useEffect(() => {
    if (!ready || !mapRef.current || lat == null || lng == null) return;
    mapRef.current.setView([lat, lng], Math.max(mapRef.current.getZoom(), 14));
    if (!markerRef.current) {
      (async () => {
        const L = (await import("leaflet")).default;
        if (!mapRef.current || markerRef.current) return;
        markerRef.current = L.marker([lat, lng], {
          draggable: editable,
          icon: L.divIcon({
            html: pinHtml(editable ? "#0D7A5F" : "#D97706"),
            className: "rozgaar-map-pin",
            iconSize: [26, 26],
            iconAnchor: [13, 26],
          }),
        }).addTo(mapRef.current);
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng, ready]);

  const locate = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => onChange?.(pos.coords.latitude, pos.coords.longitude),
      () => {},
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-line shadow-sm">
      <div ref={holderRef} style={{ height }} className="w-full bg-surface" />
      <div className="flex items-center justify-between gap-2 bg-surface px-3 py-2 text-xs text-muted">
        <span>
          {lat != null && lng != null
            ? `${lat.toFixed(5)}, ${lng.toFixed(5)}`
            : locale === "ur"
              ? "نقشے پر ٹیپ کریں اور پن رکھیں"
              : "Tap the map to drop your pin"}
        </span>
        {editable && (
          <button
            type="button"
            onClick={locate}
            className="rounded-lg border border-line px-2 py-1 font-semibold text-primary transition hover:bg-primary/10"
          >
            {locale === "ur" ? "📍 موجودہ مقام" : "📍 My location"}
          </button>
        )}
      </div>
    </div>
  );
}
