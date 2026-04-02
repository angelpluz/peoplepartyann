import { NextRequest, NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { callBackendApi, readBackendErrorMessage } from "@/lib/backend-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  noStore();

  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "Invalid news id" }, { status: 400 });
  }

  try {
    const result = await callBackendApi(`/news/${id}`);
    if (result.status >= 400) {
      return NextResponse.json(
        { error: readBackendErrorMessage(result.data, "ไม่สามารถดึงข้อมูลข่าวได้") },
        { status: result.status },
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("get news detail error:", error);
    return NextResponse.json({ error: "ไม่สามารถดึงข้อมูลข่าวได้" }, { status: 500 });
  }
}
