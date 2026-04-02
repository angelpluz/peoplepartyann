import { NextRequest, NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { getTokenFromRequest, verifyAdminToken } from "@/lib/auth";
import { callBackendApi, readBackendErrorMessage } from "@/lib/backend-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const ALLOWED_STATUS = new Set(["new", "in-progress", "done"]);

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  noStore();

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

    const result = await callBackendApi(`/reports/${id}`, {
      method: "PATCH",
      body: { status },
      requireApiKey: true,
    });

    if (result.status >= 400) {
      return NextResponse.json(
        { error: readBackendErrorMessage(result.data, "ไม่สามารถอัปเดตสถานะได้") },
        { status: result.status },
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("update report status error:", error);
    return NextResponse.json({ error: "ไม่สามารถอัปเดตสถานะได้" }, { status: 500 });
  }
}
