import { NextRequest, NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { getTokenFromRequest, verifyAdminToken } from "@/lib/auth";

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
  const { prisma } = await import("@/lib/prisma");

  try {
    const contentType = req.headers.get("content-type") || "";

    let name = "";
    let phone = "";
    let message = "";
    let location = "";
    let imageUrl: string | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      name = String(formData.get("name") || "").trim();
      phone = String(formData.get("phone") || "").trim();
      message = String(formData.get("message") || "").trim();
      location = String(formData.get("location") || "").trim();
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
    }

    const validationError = validateReport({ name, phone, message, location });
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const report = await prisma.report.create({
      data: { name, phone, message, location, imageUrl },
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    console.error("create report error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "ไม่สามารถส่งเรื่องร้องเรียนได้",
      },
      { status: error instanceof Error ? 400 : 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  noStore();
  const { prisma } = await import("@/lib/prisma");

  const token = getTokenFromRequest(req);
  if (!token || !verifyAdminToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const reports = await prisma.report.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json(reports);
  } catch (error) {
    console.error("list reports error:", error);
    return NextResponse.json({ error: "ไม่สามารถดึงข้อมูลเรื่องร้องเรียนได้" }, { status: 500 });
  }
}
