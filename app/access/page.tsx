"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AccessPage() {
  const router = useRouter();
  const [nextPath, setNextPath] = useState("/");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const next = params.get("next") || "/";
    setNextPath(next.startsWith("/") ? next : "/");
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/access/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, next: nextPath }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "เข้าสู่ระบบไม่สำเร็จ");
      }

      router.replace(payload?.next || nextPath);
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "เข้าสู่ระบบไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#2f1307]">
      <div className="app-container flex min-h-screen items-center justify-center py-10">
        <div className="glass-card-strong w-full max-w-md p-6 sm:p-8">
          <span className="eyebrow">Private Access</span>
          <h1 className="mt-4 text-3xl font-bold text-slate-950">เข้าสู่ระบบก่อนเข้าเว็บไซต์</h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            เว็บไซต์นี้ยังไม่เปิดสาธารณะ กรุณาเข้าสู่ระบบเพื่อใช้งานชั่วคราว
          </p>

          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
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
              {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่เว็บไซต์"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
