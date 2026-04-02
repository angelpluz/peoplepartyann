"use client";

import { useEffect, useState } from "react";
import { getAdminHeaders } from "../admin-auth";

type Report = {
  id: number;
  name: string;
  phone: string;
  message: string;
  status: "new" | "in-progress" | "done";
  createdAt: string;
};

const statusLabels: Record<Report["status"], string> = {
  new: "ใหม่",
  "in-progress": "กำลังดำเนินการ",
  done: "เสร็จสิ้น",
};

const statusSelectClasses: Record<Report["status"], string> = {
  new: "border-red-200 bg-red-50 text-red-700",
  "in-progress": "border-amber-200 bg-amber-50 text-amber-700",
  done: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadReports() {
      try {
        setLoading(true);
        setError("");
        const response = await fetch("/api/report", {
          headers: { ...getAdminHeaders() },
          cache: "no-store",
        });
        if (response.status === 401) throw new Error("Session หมดอายุ กรุณาเข้าสู่ระบบใหม่");
        if (!response.ok) throw new Error("ไม่สามารถโหลดข้อมูลเรื่องร้องเรียนได้");
        const data: Report[] = await response.json();
        if (!cancelled) setReports(data);
      } catch (fetchError) {
        if (!cancelled) setError(fetchError instanceof Error ? fetchError.message : "ไม่สามารถโหลดข้อมูลได้");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadReports();
    return () => {
      cancelled = true;
    };
  }, []);

  async function updateStatus(id: number, status: Report["status"]) {
    const previous = reports;
    setReports((current) => current.map((item) => (item.id === id ? { ...item, status } : item)));

    try {
      const response = await fetch(`/api/report/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAdminHeaders(),
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload?.error || "อัปเดตสถานะไม่สำเร็จ");
      }
    } catch (updateError) {
      setReports(previous);
      setError(updateError instanceof Error ? updateError.message : "อัปเดตสถานะไม่สำเร็จ");
    }
  }

  return (
    <div>
      <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h1 className="text-2xl font-bold text-slate-950">จัดการเรื่องร้องเรียน</h1>
        <p className="mt-2 text-sm leading-7 text-slate-600">
          ตรวจสอบข้อมูลผู้แจ้ง อัปเดตสถานะ และติดตามรายการที่ต้องประสานงานเร่งด่วน
        </p>
      </div>

      {loading && <p className="mt-6 text-sm text-slate-600">กำลังโหลดข้อมูล...</p>}
      {!loading && error && <p className="mt-6 rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}

      {!loading && !error && (
        <div className="mt-6 overflow-hidden rounded-[1.75rem] bg-white shadow-sm ring-1 ring-slate-200">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50">
                <tr className="text-left text-slate-700">
                  <th className="px-4 py-4 font-semibold">ผู้แจ้ง</th>
                  <th className="px-4 py-4 font-semibold">เบอร์โทร</th>
                  <th className="px-4 py-4 font-semibold">รายละเอียด</th>
                  <th className="px-4 py-4 font-semibold">สถานะ</th>
                  <th className="px-4 py-4 font-semibold">วันที่แจ้ง</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reports.map((item) => (
                  <tr key={item.id} className="align-top">
                    <td className="px-4 py-4">
                      <p className="font-semibold text-slate-900">{item.name}</p>
                    </td>
                    <td className="px-4 py-4 text-slate-700">{item.phone}</td>
                    <td className="max-w-md px-4 py-4 text-slate-600">{item.message}</td>
                    <td className="px-4 py-4">
                      <select
                        value={item.status}
                        onChange={(event) => updateStatus(item.id, event.target.value as Report["status"])}
                        className={`w-full min-w-[170px] rounded-2xl border px-4 py-3 text-sm font-semibold outline-none transition ${statusSelectClasses[item.status]}`}
                      >
                        <option value="new">{statusLabels.new}</option>
                        <option value="in-progress">{statusLabels["in-progress"]}</option>
                        <option value="done">{statusLabels.done}</option>
                      </select>
                    </td>
                    <td className="px-4 py-4 text-slate-500">
                      {new Date(item.createdAt).toLocaleDateString("th-TH", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {reports.length === 0 && <p className="p-5 text-sm text-slate-600">ยังไม่มีเรื่องร้องเรียนในระบบ</p>}
        </div>
      )}
    </div>
  );
}
