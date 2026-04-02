"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { setAdminToken } from "../admin-auth";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || "เข้าสู่ระบบไม่สำเร็จ");

      setAdminToken(payload.token);
      router.replace("/admin");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "เข้าสู่ระบบไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#4a1d09]">
      <div className="app-container flex min-h-screen items-center py-10">
        <div className="grid w-full gap-6 lg:grid-cols-[1fr_440px]">
          <div className="hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-orange-500 via-[#8a2f08] to-[#4a1d09] p-10 text-white shadow-2xl shadow-orange-950/30 lg:block">
            <p className="text-xs uppercase tracking-[0.24em] text-orange-100">Admin Access</p>
            <h1 className="mt-4 text-4xl font-bold leading-tight">ศูนย์จัดการเนื้อหาและเรื่องร้องเรียน</h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300">
              สำหรับทีมงานใช้จัดการข่าวประชาสัมพันธ์ ตรวจสอบเรื่องร้องเรียน และอัปเดตสถานะการดำเนินงาน
            </p>
          </div>

          <div className="glass-card-strong mx-auto w-full max-w-md p-6 sm:p-8">
            <span className="eyebrow">Secure Sign In</span>
            <h2 className="mt-4 text-3xl font-bold text-slate-950">เข้าสู่ระบบผู้ดูแล</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              ใช้บัญชีสำหรับทีมงานเพื่อเข้าถึงระบบหลังบ้าน
            </p>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Username</label>
                <input
                  className="field"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
                <input
                  type="password"
                  className="field"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>

              {error && <p className="rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}

              <button type="submit" className="btn-primary w-full" disabled={loading}>
                {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
              </button>
            </form>

            <p className="mt-4 text-xs text-slate-500">
              ค่าเริ่มต้นหากยังไม่ได้ตั้งค่า env: username = <code>admin</code>, password = <code>admin123</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
