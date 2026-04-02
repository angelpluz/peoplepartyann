"use client";

import { FormEvent, useEffect, useState } from "react";
import { getAdminHeaders } from "../admin-auth";

type NewsItem = {
  id: number;
  title: string;
  content: string;
  imageUrl: string | null;
  createdAt: string;
};

const initialForm = {
  title: "",
  content: "",
  imageUrl: "",
};

export default function AdminNewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadNews();
  }, []);

  async function loadNews() {
    try {
      setLoading(true);
      setError("");
      const response = await fetch("/api/news", { cache: "no-store" });
      if (!response.ok) throw new Error("โหลดรายการข่าวไม่สำเร็จ");
      const data: NewsItem[] = await response.json();
      setNews(data);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "โหลดรายการข่าวไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaving(true);

    try {
      const method = editingId ? "PUT" : "POST";
      const payload = editingId ? { ...form, id: editingId } : form;
      const response = await fetch("/api/news", {
        method,
        headers: {
          "Content-Type": "application/json",
          ...getAdminHeaders(),
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result?.error || "บันทึกข่าวไม่สำเร็จ");

      setForm(initialForm);
      setEditingId(null);
      await loadNews();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "บันทึกข่าวไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  }

  async function removeNews(id: number) {
    setError("");
    try {
      const response = await fetch("/api/news", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...getAdminHeaders(),
        },
        body: JSON.stringify({ id }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error || "ลบข่าวไม่สำเร็จ");
      setNews((current) => current.filter((item) => item.id !== id));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "ลบข่าวไม่สำเร็จ");
    }
  }

  function startEdit(item: NewsItem) {
    setEditingId(item.id);
    setForm({
      title: item.title,
      content: item.content,
      imageUrl: item.imageUrl || "",
    });
  }

  return (
    <div>
      <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h1 className="text-2xl font-bold text-slate-950">จัดการข่าวประชาสัมพันธ์</h1>
        <p className="mt-2 text-sm leading-7 text-slate-600">
          สร้างข่าวใหม่ แก้ไขข่าวเดิม และอัปเดตภาพลักษณ์ของหน้า public ให้ข้อมูลล่าสุดอยู่เสมอ
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <div className="grid gap-4">
          <input
            className="field"
            placeholder="หัวข้อข่าว"
            value={form.title}
            onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
            required
          />
          <textarea
            className="field min-h-[140px]"
            placeholder="เนื้อหาข่าว"
            value={form.content}
            onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))}
            required
          />
          <input
            className="field"
            placeholder="Image URL (ไม่บังคับ)"
            value={form.imageUrl}
            onChange={(event) => setForm((current) => ({ ...current, imageUrl: event.target.value }))}
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? "กำลังบันทึก..." : editingId ? "อัปเดตข่าว" : "สร้างข่าวใหม่"}
          </button>
          {editingId && (
            <button
              type="button"
              className="btn-outline"
              onClick={() => {
                setEditingId(null);
                setForm(initialForm);
              }}
            >
              ยกเลิกการแก้ไข
            </button>
          )}
        </div>
      </form>

      {error && <p className="mt-4 rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      {loading && <p className="mt-4 text-sm text-slate-600">กำลังโหลดรายการข่าว...</p>}

      {!loading && (
        <div className="mt-6 space-y-3">
          {news.map((item) => (
            <div key={item.id} className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-3xl">
                  <p className="text-xs uppercase tracking-[0.18em] text-orange-700">
                    {new Date(item.createdAt).toLocaleDateString("th-TH", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                  <h2 className="mt-2 text-xl font-bold text-slate-950">{item.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {item.content.slice(0, 220)}
                    {item.content.length > 220 ? "..." : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button type="button" className="btn-outline" onClick={() => startEdit(item)}>
                    แก้ไข
                  </button>
                  <button
                    type="button"
                    className="rounded-2xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                    onClick={() => removeNews(item.id)}
                  >
                    ลบ
                  </button>
                </div>
              </div>
            </div>
          ))}

          {news.length === 0 && <p className="rounded-2xl bg-slate-100 p-4 text-sm text-slate-600">ยังไม่มีข่าวในระบบ</p>}
        </div>
      )}
    </div>
  );
}
