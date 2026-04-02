import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest, verifyAdminToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

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

async function saveImage(file: File) {
  if (!file || file.size === 0) return null;
  const extension = path.extname(file.name || "").toLowerCase() || ".jpg";
  const filename = `${Date.now()}-${randomUUID()}${extension}`;
  const outputDir = path.join(process.cwd(), "public", "uploads", "reports");
  const outputPath = path.join(outputDir, filename);
  await mkdir(outputDir, { recursive: true });
  const arrayBuffer = await file.arrayBuffer();
  await writeFile(outputPath, Buffer.from(arrayBuffer));
  return `/uploads/reports/${filename}`;
}

export async function POST(req: NextRequest) {
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
        imageUrl = await saveImage(imageFile);
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
    return NextResponse.json({ error: "ไม่สามารถส่งเรื่องร้องเรียนได้" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
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
