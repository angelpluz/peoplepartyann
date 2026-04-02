"use client";

import { useEffect } from "react";
import L from "leaflet";
import { Circle, MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export type ReportMapReport = {
  id: number;
  name: string;
  message: string;
  location: string;
  status: string;
  createdAt: string;
};

type Pin = {
  id: number;
  name: string;
  status: string;
  createdAt: string;
  lat: number;
  lng: number;
  source: "meta" | "location";
};

const THUNG_KHRU_CENTER: [number, number] = [13.6371, 100.4961];
const THUNG_KHRU_RADIUS_METERS = 4500;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function parseCoordinatesFromText(input: string) {
  const regex = /([+-]?\d+(?:\.\d+)?)\s*,\s*([+-]?\d+(?:\.\d+)?)/;
  const match = input.match(regex);
  if (!match) return null;

  const lat = Number(match[1]);
  const lng = Number(match[2]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { lat, lng };
}

function extractPin(report: ReportMapReport): Pin | null {
  const message = String(report.message || "");
  const location = String(report.location || "");

  const metaGps = message.match(/\[meta\]\s*gps=([^\n\r]+)/i)?.[1];
  if (metaGps) {
    const coords = parseCoordinatesFromText(metaGps);
    if (coords) {
      return {
        id: report.id,
        name: report.name,
        status: report.status,
        createdAt: report.createdAt,
        lat: coords.lat,
        lng: coords.lng,
        source: "meta",
      };
    }
  }

  const locationGps = location.match(/GPS:\s*([^)]+)/i)?.[1];
  if (locationGps) {
    const coords = parseCoordinatesFromText(locationGps);
    if (coords) {
      return {
        id: report.id,
        name: report.name,
        status: report.status,
        createdAt: report.createdAt,
        lat: coords.lat,
        lng: coords.lng,
        source: "location",
      };
    }
  }

  return null;
}

function FitToPins({ pins }: { pins: Pin[] }) {
  const map = useMap();

  useEffect(() => {
    if (pins.length === 0) {
      map.setView(THUNG_KHRU_CENTER, 13);
      return;
    }

    if (pins.length === 1) {
      map.setView([pins[0].lat, pins[0].lng], 15);
      return;
    }

    const bounds = L.latLngBounds(pins.map((pin) => [pin.lat, pin.lng] as [number, number]));
    map.fitBounds(bounds.pad(0.22));
  }, [map, pins]);

  return null;
}

export default function ReportMap({ reports }: { reports: ReportMapReport[] }) {
  const pins = reports
    .map(extractPin)
    .filter((pin): pin is Pin => pin !== null);

  return (
    <div className="mt-6 rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-950">แผนที่เรื่องร้องเรียน เขตทุ่งครุ</h2>
          <p className="mt-1 text-sm text-slate-600">
            ปักหมุดจากพิกัด GPS ที่ส่งมาพร้อมคำร้อง (จาก EXIF รูป หรือจากตำแหน่งมือถือ)
          </p>
        </div>
        <p className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
          ปักหมุดได้ {pins.length} รายการ
        </p>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
        <MapContainer
          center={THUNG_KHRU_CENTER}
          zoom={13}
          scrollWheelZoom
          style={{ height: "420px", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <Circle
            center={THUNG_KHRU_CENTER}
            radius={THUNG_KHRU_RADIUS_METERS}
            pathOptions={{ color: "#f97316", weight: 1.5, fillOpacity: 0.08 }}
          />

          <FitToPins pins={pins} />

          {pins.map((pin) => (
            <Marker key={pin.id} position={[pin.lat, pin.lng]}>
              <Popup>
                <div className="space-y-1 text-sm">
                  <p className="font-semibold text-slate-900">{pin.name || "ไม่ระบุชื่อ"}</p>
                  <p className="text-slate-700">สถานะ: {pin.status}</p>
                  <p className="text-slate-600">
                    {new Date(pin.createdAt).toLocaleString("th-TH", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <p className="text-slate-600">
                    {pin.lat.toFixed(6)}, {pin.lng.toFixed(6)}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {pins.length === 0 && (
        <p className="mt-3 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
          ยังไม่พบพิกัดในคำร้องเรียน ให้ผู้แจ้งแนบรูปที่มี EXIF GPS หรือกดปุ่มตำแหน่งปัจจุบันตอนส่งฟอร์ม
        </p>
      )}
    </div>
  );
}
