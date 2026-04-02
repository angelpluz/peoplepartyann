"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

type GpsState = {
  lat: number;
  lng: number;
  accuracy: number | null;
};

const REPORTER_UID_STORAGE_KEY = "peopleparty_reporter_uid";

function createReporterUid() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  const seed = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `uid-${seed}`;
}

function getLocationErrorMessage(error: GeolocationPositionError) {
  if (error.code === error.PERMISSION_DENIED) {
    return "กรุณาอนุญาตสิทธิ์ Location เพื่อดึงพิกัด GPS";
  }
  if (error.code === error.POSITION_UNAVAILABLE) {
    return "ไม่สามารถระบุตำแหน่งได้ในตอนนี้";
  }
  if (error.code === error.TIMEOUT) {
    return "หมดเวลาในการค้นหาตำแหน่ง กรุณาลองใหม่";
  }
  return "ไม่สามารถอ่านพิกัด GPS ได้";
}

function formatGpsLabel(gps: GpsState) {
  const lat = gps.lat.toFixed(6);
  const lng = gps.lng.toFixed(6);
  return `GPS: ${lat}, ${lng}`;
}

export default function ReportPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [location, setLocation] = useState("");
  const [reporterUid, setReporterUid] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [gps, setGps] = useState<GpsState | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    try {
      const existing = window.localStorage.getItem(REPORTER_UID_STORAGE_KEY);
      if (existing && existing.trim()) {
        setReporterUid(existing.trim());
        return;
      }

      const generated = createReporterUid();
      window.localStorage.setItem(REPORTER_UID_STORAGE_KEY, generated);
      setReporterUid(generated);
    } catch {
      setReporterUid(createReporterUid());
    }
  }, []);

  async function handleUseCurrentLocation() {
    setLocationError("");
    setError("");

    if (!window.isSecureContext) {
      setLocationError("การอ่านพิกัด GPS ต้องใช้ผ่าน HTTPS");
      return;
    }

    if (!navigator.geolocation) {
      setLocationError("อุปกรณ์นี้ไม่รองรับการระบุตำแหน่ง");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextGps: GpsState = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: Number.isFinite(position.coords.accuracy)
            ? position.coords.accuracy
            : null,
        };

        setGps(nextGps);
        setLocation((current) => {
          const trimmed = current.trim();
          const gpsLabel = formatGpsLabel(nextGps);
          if (!trimmed) return gpsLabel;
          if (trimmed.includes("GPS:")) return trimmed;
          return `${trimmed} (${gpsLabel})`;
        });
        setLocating(false);
      },
      (geoError) => {
        setLocating(false);
        setLocationError(getLocationErrorMessage(geoError));
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      },
    );
  }

  function handleOpenCamera() {
    cameraInputRef.current?.click();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (name.trim().length < 2) return setError("กรุณากรอกชื่อให้ถูกต้อง");
    if (phone.trim().length < 8) return setError("กรุณากรอกเบอร์โทรให้ถูกต้อง");
    if (message.trim().length < 5) return setError("กรุณากรอกรายละเอียดเพิ่มเติม");
    if (location.trim().length < 2) return setError("กรุณากรอกสถานที่");

    setLoading(true);
    try {
      const formData = new FormData();
      formData.set("name", name.trim());
      formData.set("phone", phone.trim());
      formData.set("message", message.trim());
      formData.set("location", location.trim());
      formData.set("reporterUid", reporterUid || createReporterUid());
      if (image) formData.set("image", image);
      if (gps) {
        formData.set("gpsLat", String(gps.lat));
        formData.set("gpsLng", String(gps.lng));
        if (gps.accuracy !== null) {
          formData.set("gpsAccuracy", String(gps.accuracy));
        }
      }

      const response = await fetch("/api/report", {
        method: "POST",
        body: formData,
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "ส่งเรื่องร้องเรียนไม่สำเร็จ");
      }

      setSuccess("ส่งเรื่องร้องเรียนเรียบร้อยแล้ว ทีมงานจะติดตามและประสานงานกลับโดยเร็วที่สุด");
      setName("");
      setPhone("");
      setMessage("");
      setLocation("");
      setImage(null);
      setGps(null);
      setLocationError("");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "ส่งเรื่องร้องเรียนไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-container py-10">
      <div className="grid gap-6 lg:grid-cols-[0.88fr_1.12fr]">
        <div className="glass-card-strong p-6 sm:p-8">
          <span className="eyebrow">Public Complaint Channel</span>
          <h1 className="mt-4 text-3xl font-bold text-slate-950 sm:text-4xl">แจ้งเรื่องร้องเรียน</h1>
          <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
            ใช้แบบฟอร์มนี้เพื่อแจ้งปัญหาในพื้นที่ เช่น ถนนชำรุด น้ำท่วม ไฟฟ้าสาธารณะ
            หรือเรื่องที่ต้องการให้ทีมงานช่วยติดตาม
          </p>

          <div className="mt-8 space-y-3">
            <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
              <p className="text-sm font-semibold text-slate-900">1. กรอกข้อมูลให้ครบถ้วน</p>
              <p className="mt-1 text-sm text-slate-600">ชื่อ เบอร์โทร และสถานที่ช่วยให้ทีมงานติดตามได้เร็วขึ้น</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
              <p className="text-sm font-semibold text-slate-900">2. แนบภาพจากกล้องหรือแกลเลอรี</p>
              <p className="mt-1 text-sm text-slate-600">ภาพประกอบช่วยยืนยันสภาพปัญหาและลดเวลาในการประสานงาน</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
              <p className="text-sm font-semibold text-slate-900">3. ใช้พิกัด GPS จากมือถือ</p>
              <p className="mt-1 text-sm text-slate-600">กดปุ่มใช้ตำแหน่งปัจจุบันเพื่อแนบพิกัดลงในรายการร้องเรียน</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 sm:p-8">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">ชื่อผู้แจ้ง</label>
                <input
                  className="field"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="เช่น สมชาย ใจดี"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">เบอร์โทรศัพท์</label>
                <input
                  className="field"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="เช่น 0891234567"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">สถานที่เกิดเหตุ</label>
              <input
                className="field"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="ชุมชน/หมู่บ้าน/ถนน/จุดสังเกต"
                required
              />
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  className="btn-outline"
                  disabled={locating}
                >
                  {locating ? "กำลังอ่านพิกัด..." : "ใช้ตำแหน่งปัจจุบัน (GPS)"}
                </button>
              </div>
              {gps && (
                <p className="mt-2 text-xs text-slate-500">
                  ได้พิกัดแล้ว: {formatGpsLabel(gps)}
                  {gps.accuracy !== null ? ` (accuracy ${Math.round(gps.accuracy)}m)` : ""}
                </p>
              )}
              {locationError && <p className="mt-2 rounded-xl bg-amber-50 p-2 text-xs text-amber-700">{locationError}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">รายละเอียดปัญหา</label>
              <textarea
                className="field min-h-[170px]"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="อธิบายปัญหาที่ต้องการให้ช่วยประสานงานหรือแก้ไข"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">แนบรูปภาพเพิ่มเติม</label>
              <div className="flex flex-wrap gap-2">
                <button type="button" className="btn-outline" onClick={handleOpenCamera}>
                  ถ่ายรูปจากกล้องมือถือ
                </button>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                ถ้ารูปมีพิกัด GPS ใน EXIF ระบบจะดึงพิกัดอัตโนมัติ และยังสามารถกดปุ่ม GPS ด้านบนเพื่อยืนยันตำแหน่งปัจจุบันได้
              </p>
              <input
                ref={cameraInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                capture="environment"
                onChange={(event) => {
                  const nextFile = event.target.files?.[0] || null;
                  setImage(nextFile);
                }}
              />
              <input
                type="file"
                className="field mt-2 p-2"
                accept="image/*"
                onChange={(event) => {
                  const nextFile = event.target.files?.[0] || null;
                  setImage(nextFile);
                }}
              />
              {image && <p className="mt-2 text-xs text-slate-500">ไฟล์ที่เลือก: {image.name}</p>}
            </div>

            <p className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">
              ระบบจะบันทึก UID ของอุปกรณ์, IP และพิกัด (ถ้ามี) เพื่อช่วยตรวจสอบรายการแจ้ง
            </p>

            {error && <p className="rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            {success && <p className="rounded-2xl bg-emerald-50 p-3 text-sm text-emerald-700">{success}</p>}

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? "กำลังส่งข้อมูล..." : "ส่งเรื่องร้องเรียน"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
