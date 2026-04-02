import { NextRequest, NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { getTokenFromRequest, verifyAdminToken } from "@/lib/auth";
import { callBackendApi, readBackendErrorMessage } from "@/lib/backend-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/avif",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

type GpsCoordinates = {
  lat: number;
  lng: number;
  accuracy: number | null;
} | null;

function validateReport(data: {
  name: string;
  phone: string;
  message: string;
  location: string;
}) {
  if (!data.name || data.name.length < 2) return "กรุณากรอกชื่อให้ถูกต้อง";
  if (!data.phone || data.phone.length < 8) return "กรุณากรอกเบอร์โทรให้ถูกต้อง";
  if (!data.message || data.message.length < 5) return "กรุณากรอกรายละเอียดปัญหา";
  if (!data.location || data.location.length < 2) return "กรุณากรอกสถานที่";
  return null;
}

function parseNumeric(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function parseGpsCoordinates(data: {
  gpsLat?: unknown;
  gpsLng?: unknown;
  gpsAccuracy?: unknown;
}): GpsCoordinates {
  const lat = parseNumeric(data.gpsLat);
  const lng = parseNumeric(data.gpsLng);

  if (lat === null && lng === null) return null;
  if (lat === null || lng === null) {
    throw new Error("พิกัด GPS ไม่ครบถ้วน");
  }

  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    throw new Error("พิกัด GPS ไม่ถูกต้อง");
  }

  const rawAccuracy = parseNumeric(data.gpsAccuracy);
  const accuracy = rawAccuracy !== null && rawAccuracy >= 0 ? rawAccuracy : null;

  return { lat, lng, accuracy };
}

function appendGpsToLocation(location: string, gps: GpsCoordinates) {
  if (!gps) return location;

  const gpsLabel = `GPS: ${gps.lat.toFixed(6)}, ${gps.lng.toFixed(6)}`;
  if (!location) return gpsLabel;
  if (location.includes("GPS:")) return location;
  return `${location} (${gpsLabel})`;
}

async function fileToDataUrl(file: File) {
  if (!file || file.size === 0) return null;

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("รองรับเฉพาะไฟล์ภาพ JPG, PNG, WEBP, GIF และ AVIF");
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error("ไฟล์ภาพต้องมีขนาดไม่เกิน 2MB");
  }

  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  return `data:${file.type};base64,${base64}`;
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    let name = "";
    let phone = "";
    let message = "";
    let location = "";
    let imageUrl: string | null = null;
    let gps: GpsCoordinates = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      name = String(formData.get("name") || "").trim();
      phone = String(formData.get("phone") || "").trim();
      message = String(formData.get("message") || "").trim();
      location = String(formData.get("location") || "").trim();
      gps = parseGpsCoordinates({
        gpsLat: formData.get("gpsLat"),
        gpsLng: formData.get("gpsLng"),
        gpsAccuracy: formData.get("gpsAccuracy"),
      });

      const imageFile = formData.get("image");
      if (imageFile instanceof File && imageFile.size > 0) {
        imageUrl = await fileToDataUrl(imageFile);
      }
    } else {
      const body = await req.json();
      name = String(body?.name || "").trim();
      phone = String(body?.phone || "").trim();
      message = String(body?.message || "").trim();
      location = String(body?.location || "").trim();
      imageUrl = body?.imageUrl ? String(body.imageUrl) : null;
      gps = parseGpsCoordinates({
        gpsLat: body?.gpsLat,
        gpsLng: body?.gpsLng,
        gpsAccuracy: body?.gpsAccuracy,
      });
    }

    location = appendGpsToLocation(location, gps);

    const validationError = validateReport({ name, phone, message, location });
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const result = await callBackendApi("/reports", {
      method: "POST",
      body: { name, phone, message, location, imageUrl },
    });

    if (result.status >= 400) {
      return NextResponse.json(
        { error: readBackendErrorMessage(result.data, "ไม่สามารถส่งเรื่องร้องเรียนได้") },
        { status: result.status },
      );
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (error) {
    console.error("create report error:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "ไม่สามารถส่งเรื่องร้องเรียนได้",
      },
      { status: error instanceof Error ? 400 : 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  noStore();

  const token = getTokenFromRequest(req);
  if (!token || !verifyAdminToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await callBackendApi("/reports", {
      requireApiKey: true,
    });

    if (result.status >= 400) {
      return NextResponse.json(
        { error: readBackendErrorMessage(result.data, "ไม่สามารถดึงข้อมูลเรื่องร้องเรียนได้") },
        { status: result.status },
      );
    }

    return NextResponse.json(result.data ?? []);
  } catch (error) {
    console.error("list reports error:", error);
    return NextResponse.json({ error: "ไม่สามารถดึงข้อมูลเรื่องร้องเรียนได้" }, { status: 500 });
  }
}
