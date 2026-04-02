import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest, verifyAdminToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ALLOWED_STATUS = new Set(["new", "in-progress", "done"]);

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const token = getTokenFromRequest(req);
  if (!token || !verifyAdminToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "Invalid report id" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const status = String(body?.status || "");
    if (!ALLOWED_STATUS.has(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const report = await prisma.report.update({
      where: { id },
      data: { status },
    });
    return NextResponse.json(report);
  } catch (error) {
    console.error("update report status error:", error);
    return NextResponse.json({ error: "ไม่สามารถอัปเดตสถานะได้" }, { status: 500 });
  }
}
