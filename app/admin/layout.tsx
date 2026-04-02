"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearAdminToken, getAdminToken } from "./admin-auth";

const navItems = [
  { href: "/admin", label: "ภาพรวม" },
  { href: "/admin/reports", label: "จัดการร้องเรียน" },
  { href: "/admin/news", label: "จัดการข่าว" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/admin/login";
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (isLoginPage) {
      setReady(true);
      return;
    }

    const token = getAdminToken();
    if (!token) {
      router.replace("/admin/login");
      return;
    }

    setReady(true);
  }, [isLoginPage, router]);

  if (!ready) {
    return (
      <div className="app-container py-10">
        <p className="text-sm text-slate-600">กำลังตรวจสอบสิทธิ์ผู้ใช้งาน...</p>
      </div>
    );
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#4a1d09]">
      <div className="app-container py-6">
        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <aside className="rounded-[2rem] border border-white/10 bg-gradient-to-b from-[#8a2f08] to-[#4a1d09] px-5 py-6 text-white shadow-2xl shadow-orange-950/30">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-orange-200">Admin Panel</p>
              <h2 className="mt-2 text-2xl font-bold">ระบบหลังบ้าน</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">จัดการข่าวประชาสัมพันธ์และติดตามเรื่องร้องเรียนจากประชาชน</p>
            </div>

            <nav className="mt-6 space-y-2">
              {navItems.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block rounded-2xl px-4 py-3 text-sm font-medium transition ${
                      active
                        ? "bg-orange-500 text-white shadow-lg shadow-orange-900/30"
                        : "text-slate-200 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-8 rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Session</p>
              <p className="mt-2 text-sm text-slate-200">เข้าสู่ระบบด้วย token ฝั่ง client สำหรับ mock admin workflow</p>
              <button
                className="mt-4 w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                onClick={() => {
                  clearAdminToken();
                  router.replace("/admin/login");
                }}
              >
                ออกจากระบบ
              </button>
            </div>
          </aside>

          <main className="rounded-[2rem] bg-slate-50 p-5 shadow-2xl shadow-slate-950/20 sm:p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
