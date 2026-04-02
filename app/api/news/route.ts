import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest, verifyAdminToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function validateNews(payload: { title: string; content: string }) {
  if (!payload.title || payload.title.length < 4) {
    return "กรุณากรอกหัวข้อข่าวอย่างน้อย 4 ตัวอักษร";
  }
  if (!payload.content || payload.content.length < 20) {
    return "กรุณากรอกเนื้อหาข่าวอย่างน้อย 20 ตัวอักษร";
  }
  return null;
}

function ensureAdmin(req: NextRequest) {
  const token = getTokenFromRequest(req);
  return token && verifyAdminToken(token);
}

export async function GET() {
  try {
    const news = await prisma.news.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json(news);
  } catch (error) {
    console.error("list news error:", error);
    return NextResponse.json({ error: "ไม่สามารถดึงข้อมูลข่าวได้" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!ensureAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const title = String(body?.title || "").trim();
    const content = String(body?.content || "").trim();
    const imageUrl = body?.imageUrl ? String(body.imageUrl).trim() : null;
    const validationError = validateNews({ title, content });

    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const newsItem = await prisma.news.create({ data: { title, content, imageUrl } });
    return NextResponse.json(newsItem, { status: 201 });
  } catch (error) {
    console.error("create news error:", error);
    return NextResponse.json({ error: "ไม่สามารถสร้างข่าวได้" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  if (!ensureAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const id = Number(body?.id);
    const title = String(body?.title || "").trim();
    const content = String(body?.content || "").trim();
    const imageUrl = body?.imageUrl ? String(body.imageUrl).trim() : null;
    const validationError = validateNews({ title, content });

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: "Invalid news id" }, { status: 400 });
    }
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const newsItem = await prisma.news.update({
      where: { id },
      data: { title, content, imageUrl },
    });
    return NextResponse.json(newsItem);
  } catch (error) {
    console.error("update news error:", error);
    return NextResponse.json({ error: "ไม่สามารถอัปเดตข่าวได้" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!ensureAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const id = Number(body?.id);
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: "Invalid news id" }, { status: 400 });
    }

    await prisma.news.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("delete news error:", error);
    return NextResponse.json({ error: "ไม่สามารถลบข่าวได้" }, { status: 500 });
  }
}
