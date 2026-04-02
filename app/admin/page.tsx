"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { getAdminHeaders } from "./admin-auth";
import type { ReportMapReport } from "./report-map";

const ReportMap = dynamic(() => import("./report-map"), { ssr: false });

type Report = ReportMapReport & {
  phone: string;
};

export default function AdminDashboardPage() {
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
        if (!response.ok) throw new Error("ไม่สามารถโหลดข้อมูลได้");
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

  const latestReports = reports.slice(0, 5);
  const inProgressCount = reports.filter((item) => item.status === "in-progress").length;
  const doneCount = reports.filter((item) => item.status === "done").length;

  return (
    <div>
      <div className="rounded-[2rem] bg-gradient-to-r from-[#8a2f08] to-[#c2410c] px-6 py-6 text-white">
        <p className="text-xs uppercase tracking-[0.22em] text-orange-100">Overview</p>
        <h1 className="mt-3 text-3xl font-bold">ภาพรวมระบบหลังบ้าน</h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300">
          ติดตามจำนวนเรื่องร้องเรียนล่าสุด ตรวจสอบสถานะงาน และดูแนวโน้มการตอบสนองของทีมงาน
        </p>
      </div>

      {loading && <p className="mt-6 text-sm text-slate-600">กำลังโหลดข้อมูล...</p>}
      {!loading && error && <p className="mt-6 rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}

      {!loading && !error && (
        <>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Total Reports</p>
              <p className="mt-3 text-4xl font-bold text-slate-950">{reports.length}</p>
              <p className="mt-2 text-sm text-slate-600">เรื่องร้องเรียนทั้งหมดในระบบ</p>
            </div>
            <div className="rounded-[1.75rem] bg-orange-50 p-5 shadow-sm ring-1 ring-orange-100">
              <p className="text-xs uppercase tracking-[0.18em] text-orange-700">In Progress</p>
              <p className="mt-3 text-4xl font-bold text-orange-900">{inProgressCount}</p>
              <p className="mt-2 text-sm text-orange-800/80">รายการที่กำลังติดตามและประสานงาน</p>
            </div>
            <div className="rounded-[1.75rem] bg-emerald-50 p-5 shadow-sm ring-1 ring-emerald-100">
              <p className="text-xs uppercase tracking-[0.18em] text-emerald-700">Closed</p>
              <p className="mt-3 text-4xl font-bold text-emerald-900">{doneCount}</p>
              <p className="mt-2 text-sm text-emerald-800/80">รายการที่ดำเนินการเสร็จแล้ว</p>
            </div>
          </div>

          <ReportMap reports={reports} />

          <div className="mt-6 rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-950">เรื่องร้องเรียนล่าสุด</h2>
                <p className="mt-1 text-sm text-slate-600">แสดงรายการล่าสุดเพื่อให้ทีมงานติดตามได้ทันที</p>
              </div>
            </div>

            {latestReports.length === 0 ? (
              <p className="mt-4 rounded-2xl bg-slate-100 p-4 text-sm text-slate-600">ยังไม่มีรายการร้องเรียน</p>
            ) : (
              <div className="mt-4 space-y-3">
                {latestReports.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-base font-semibold text-slate-900">{item.name}</p>
                        <p className="mt-1 text-sm text-slate-600">{item.phone}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Status</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">{item.status}</p>
                      </div>
                    </div>
                    <p className="mt-3 text-xs text-slate-500">
                      {new Date(item.createdAt).toLocaleDateString("th-TH", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
