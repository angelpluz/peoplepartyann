"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type NewsItem = {
  id: number;
  title: string;
  content: string;
  imageUrl: string | null;
  createdAt: string;
};

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadNews() {
      try {
        setLoading(true);
        setError("");
        const response = await fetch("/api/news", { cache: "no-store" });
        if (!response.ok) throw new Error("โหลดข่าวไม่สำเร็จ");
        const data: NewsItem[] = await response.json();
        if (!cancelled) setNews(data);
      } catch {
        if (!cancelled) setError("ไม่สามารถโหลดรายการข่าวได้ในขณะนี้");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadNews();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="app-container py-10">
      <div className="glass-card-strong p-6 sm:p-8">
        <span className="eyebrow">Public Newsroom</span>
        <h1 className="mt-4 text-3xl font-bold text-slate-950 sm:text-4xl">ข่าวประชาสัมพันธ์</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
          รวบรวมข่าวสาร กิจกรรมในพื้นที่ และข้อมูลที่ประชาชนควรทราบ
        </p>
      </div>

      {loading && <p className="mt-6 text-sm text-slate-600">กำลังโหลดข่าวประชาสัมพันธ์...</p>}
      {!loading && error && <p className="mt-6 rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      {!loading && !error && news.length === 0 && (
        <p className="mt-6 rounded-2xl bg-slate-100 p-4 text-sm text-slate-700">ยังไม่มีข่าวในระบบ</p>
      )}

      {!loading && !error && news.length > 0 && (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {news.map((item, index) => (
            <article
              key={item.id}
              className={`glass-card flex h-full flex-col p-5 ${index === 0 ? "md:col-span-2 xl:col-span-2" : ""}`}
            >
              <p className="text-xs font-medium text-orange-700">
                {new Date(item.createdAt).toLocaleDateString("th-TH", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
              <h2 className={`mt-3 font-bold text-slate-900 ${index === 0 ? "text-2xl" : "text-xl"}`}>{item.title}</h2>
              <p className="mt-3 flex-1 text-sm leading-7 text-slate-600">
                {item.content.slice(0, index === 0 ? 260 : 150)}
                {item.content.length > (index === 0 ? 260 : 150) ? "..." : ""}
              </p>
              <Link href={`/news/${item.id}`} className="mt-5 inline-flex text-sm font-semibold text-orange-700 hover:text-orange-900">
                อ่านต่อ
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
