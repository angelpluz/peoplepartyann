"use client";

import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { useEffect, useState } from "react";

type NewsItem = {
  id: number;
  title: string;
  content: string;
  imageUrl: string | null;
  createdAt: string;
};

const FACEBOOK_PAGE_URL = "https://www.facebook.com/AnnsiriW";
const FACEBOOK_PLUGIN_URL = `https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(
  FACEBOOK_PAGE_URL,
)}&tabs=timeline&width=500&height=620&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=false`;
const TIKTOK_PROFILE_URL = "https://www.tiktok.com/@annsiriw";

const quickLinks = [
  {
    title: "ข่าวประชาสัมพันธ์",
    href: "/news",
    description: "อัปเดตข่าวล่าสุด กิจกรรมในพื้นที่ และประกาศสำคัญ",
  },
  {
    title: "ช่องทางร้องเรียน",
    href: "/report",
    description: "แจ้งปัญหาในพื้นที่ผ่านเว็บไซต์ได้โดยตรง",
  },
  {
    title: "ฟอร์มรับเรื่อง",
    href: "https://forms.gle/7EVbdRcZYiai3BEY8",
    description: "ส่งเรื่องร้องเรียนและข้อเสนอแนะผ่าน Google Form",
  },
  {
    title: "LINE OpenChat",
    href: "https://line.me/ti/g2/EO7S027mKM453QldGGk3i_DeRq_WSr9nVK0mQQ?utm_source=invitation&utm_medium=link_copy&utm_campaign=default",
    description: "เข้าร่วมชุมชนประชาชน ทุ่งครุ-ราษฎร์บูรณะ",
  },
];

const impactItems = [
  { label: "รับเรื่องจากประชาชน", value: "24/7" },
  { label: "พื้นที่ทำงาน", value: "ทุ่งครุ-ราษฎร์บูรณะ" },
  { label: "ช่องทางหลัก", value: "Facebook + ชุมชน" },
];

const tickerItems = [
  "รวมทุกช่องทางสื่อสารอย่างเป็นทางการไว้ในหน้าเดียว",
  "ติดตามข่าวสาร กิจกรรมในพื้นที่ และการลงพื้นที่ล่าสุดได้ทันที",
  "แจ้งปัญหาและข้อเสนอแนะได้ทั้งผ่านเว็บและฟอร์มออนไลน์",
  "Facebook Page จะถูกใช้เป็นช่องทางหลักสำหรับอัปเดตงานล่าสุด",
];

const channelCards = [
  {
    platform: "Facebook Group",
    title: "เล่าสู่กันฟัง @ ราษฎร์บูรณะ-ทุ่งครุ",
    href: "https://www.facebook.com/share/g/184wDxGBjg/",
    summary: "พื้นที่รวมเสียงจากชุมชนเพื่อส่งต่อประเด็นและติดตามงานในพื้นที่",
  },
  {
    platform: "TikTok",
    title: "@annsiriw",
    href: "https://www.tiktok.com/@annsiriw",
    summary: "คลิปสั้นสรุปประเด็นงานภาคสนามและบรรยากาศการทำงานล่าสุด",
  },
  {
    platform: "Instagram",
    title: "@annsiriw",
    href: "https://www.instagram.com/annsiriw",
    summary: "ภาพกิจกรรม ภาพลงพื้นที่ และการสื่อสารรายวันในรูปแบบภาพถ่าย",
  },
];

function SmartLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  if (href.startsWith("http")) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={className}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

export default function HomePage() {
  const [highlights, setHighlights] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadNews() {
      try {
        setLoading(true);
        setError("");
        const response = await fetch("/api/news", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("ไม่สามารถโหลดข่าวได้");
        }
        const data: NewsItem[] = await response.json();
        if (!cancelled) {
          setHighlights(data.slice(0, 3));
        }
      } catch {
        if (!cancelled) {
          setError("ยังไม่สามารถโหลดข่าวประชาสัมพันธ์ได้ในขณะนี้");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadNews();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="pb-20">
      <Script src="https://www.tiktok.com/embed.js" strategy="lazyOnload" />

      <section className="app-container pt-6 sm:pt-8">
        <div className="marquee-shell mb-5">
          <div className="marquee-track">
            {[...tickerItems, ...tickerItems].map((item, index) => (
              <div key={`${item}-${index}`} className="marquee-item">
                <span className="marquee-dot" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card-strong fade-up relative overflow-hidden p-6 sm:p-8 lg:p-10">
          <div className="hero-orb hero-orb-left" />
          <div className="hero-orb hero-orb-right" />
          <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-gradient-to-l from-orange-100/70 to-transparent lg:block" />

          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div className="relative z-10">
              <span className="eyebrow">Official Communication Hub</span>
              <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight text-slate-950 sm:text-5xl lg:text-6xl">
                แอนศิริ วลัยกนก
              </h1>
              <p className="mt-2 text-lg font-semibold text-orange-700">พื้นที่ทุ่งครุ-ราษฎร์บูรณะ</p>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                ศูนย์รวมช่องทางสื่อสารอย่างเป็นทางการสำหรับประชาชนในพื้นที่ ทั้งการติดตามข่าวสารจาก Facebook
                Page การแจ้งปัญหาผ่านเว็บไซต์ และการเข้าร่วมชุมชนออนไลน์เพื่อส่งต่อประเด็นและติดตามการทำงานได้ต่อเนื่อง
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <SmartLink href={FACEBOOK_PAGE_URL} className="btn-primary">
                  ดูโพสต์ล่าสุดบน Facebook
                </SmartLink>
                <SmartLink href="/report" className="btn-outline">
                  ส่งเรื่องร้องเรียน
                </SmartLink>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {impactItems.map((item, index) => (
                  <div
                    key={item.label}
                    className="floating-stat rounded-2xl border border-orange-100 bg-white/80 p-4"
                    style={{ animationDelay: `${index * 160}ms` }}
                  >
                    <p className="text-2xl font-bold text-slate-900">{item.value}</p>
                    <p className="mt-1 text-sm text-slate-600">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="fade-up-delay relative mx-auto flex w-full max-w-lg flex-col gap-4">
              <div className="relative">
                <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-orange-500/25 via-transparent to-amber-300/25 blur-2xl" />
                <div className="floating-card glass-card-strong relative overflow-hidden p-4">
                  <div className="hero-shine" />
                  <div className="absolute inset-x-6 top-6 h-24 rounded-full bg-orange-100/90 blur-2xl" />
                  <div className="relative rounded-[2rem] bg-gradient-to-br from-orange-500 via-orange-400 to-amber-300 p-4">
                    <Image
                      src="/profile-placeholder.svg"
                      alt="รูปโปรไฟล์แอนศิริ วลัยกนก"
                      width={520}
                      height={520}
                      priority
                      className="h-auto w-full rounded-[1.5rem] object-cover"
                    />
                  </div>
                  <div className="relative mt-4 rounded-2xl bg-[#2f1307] px-4 py-4 text-white">
                    <p className="text-xs uppercase tracking-[0.2em] text-orange-200">Facebook First</p>
                    <p className="mt-2 text-sm leading-6 text-orange-50">
                      โพสต์ล่าสุดจากเพจจะถูกแสดงในหน้าแรกทันที เพื่อให้ประชาชนเห็นความเคลื่อนไหวล่าสุดโดยไม่ต้องออกจากเว็บไซต์
                    </p>
                  </div>
                </div>
              </div>

              <div className="glass-card-strong overflow-hidden p-5">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-orange-700">News Highlight</p>
                    <h2 className="mt-2 text-2xl font-bold text-slate-950">ข่าวไฮไลต์</h2>
                  </div>
                  <Link
                    href="/news"
                    className="text-sm font-semibold text-orange-700 transition hover:text-orange-900"
                  >
                    ดูทั้งหมด
                  </Link>
                </div>

                {loading && <p className="mt-4 text-sm text-slate-600">กำลังโหลดข่าวประชาสัมพันธ์...</p>}
                {!loading && error && <p className="mt-4 rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
                {!loading && !error && highlights.length === 0 && (
                  <p className="mt-4 rounded-2xl bg-slate-100 p-4 text-sm text-slate-700">ยังไม่มีข่าวในระบบ</p>
                )}

                {!loading && !error && highlights.length > 0 && (
                  <div className="mt-4 space-y-3">
                    {highlights.map((item, index) => (
                      <article
                        key={item.id}
                        className={`rounded-2xl border p-4 ${
                          index === 0
                            ? "border-orange-200 bg-gradient-to-br from-orange-50 to-white"
                            : "border-slate-200 bg-white/90"
                        }`}
                      >
                        <p className="text-xs font-medium text-orange-700">
                          {new Date(item.createdAt).toLocaleDateString("th-TH", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                        <h3 className="mt-2 line-clamp-2 text-lg font-bold text-slate-900">{item.title}</h3>
                        <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{item.content}</p>
                        <Link
                          href={`/news/${item.id}`}
                          className="mt-4 inline-flex text-sm font-semibold text-orange-700 transition hover:text-orange-900"
                        >
                          อ่านรายละเอียด
                        </Link>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="app-container mt-12">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="section-title">อัปเดตล่าสุดจาก Facebook</h2>
            <p className="section-caption">แสดงฟีดล่าสุดจากเพจหลักโดยตรงบนหน้าแรก</p>
          </div>
          <a
            href={FACEBOOK_PAGE_URL}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-semibold text-orange-700 transition hover:text-orange-900"
          >
            เปิดเพจเต็มบน Facebook
          </a>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="glass-card-strong overflow-hidden p-3 sm:p-4">
            <div className="overflow-hidden rounded-[1.75rem] border border-orange-100 bg-white">
              <iframe
                title="Facebook Page Feed"
                src={FACEBOOK_PLUGIN_URL}
                className="block h-[620px] w-full"
                style={{ border: "none", overflow: "hidden" }}
                scrolling="no"
                allow="encrypted-media; picture-in-picture; web-share"
              />
            </div>
          </div>

          <div className="grid gap-4">
            <div className="glass-card-strong relative overflow-hidden p-6">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-300" />
              <p className="text-xs uppercase tracking-[0.2em] text-orange-700">Page Overview</p>
              <h3 className="mt-3 text-2xl font-bold text-slate-950">Facebook เป็นช่องทางอัปเดตหลัก</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                ใช้ส่วนนี้เพื่อแสดงโพสต์ล่าสุดจากเพจแบบสดบนหน้า home โดยตรง เหมาะกับข่าวลงพื้นที่ งานประชาสัมพันธ์
                และประกาศที่ต้องการให้คนเห็นทันทีตั้งแต่หน้าแรก
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <SmartLink href={FACEBOOK_PAGE_URL} className="btn-primary">
                  ไปที่เพจ
                </SmartLink>
                <SmartLink href="https://www.facebook.com/share/g/184wDxGBjg/" className="btn-outline">
                  เข้ากลุ่มชุมชน
                </SmartLink>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
              {channelCards.map((card) => (
                <a
                  key={card.href}
                  href={card.href}
                  target="_blank"
                  rel="noreferrer"
                  className="glass-card group min-h-[170px] p-5 transition duration-200 hover:-translate-y-1 hover:shadow-2xl"
                >
                  <div className="flex h-full flex-col justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-orange-700">{card.platform}</p>
                      <h4 className="mt-3 text-xl font-bold text-slate-950">{card.title}</h4>
                      <p className="mt-3 text-sm leading-7 text-slate-600">{card.summary}</p>
                    </div>
                    <span className="mt-5 text-sm font-semibold text-orange-700 transition group-hover:text-orange-900">
                      เปิดช่องทางนี้
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="app-container mt-12">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="section-title">อัปเดตจาก TikTok</h2>
            <p className="section-caption">แสดงโปรไฟล์และวิดีโอล่าสุดจากบัญชี TikTok บนหน้าแรก</p>
          </div>
          <a
            href={TIKTOK_PROFILE_URL}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-semibold text-orange-700 transition hover:text-orange-900"
          >
            เปิด TikTok เต็ม
          </a>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="glass-card-strong relative overflow-hidden p-6">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-slate-950 via-orange-500 to-pink-500" />
            <p className="text-xs uppercase tracking-[0.2em] text-orange-700">Creator Profile</p>
            <h3 className="mt-3 text-2xl font-bold text-slate-950">@annsiriw</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              ส่วนนี้ดึง TikTok Creator Profile Embed มาแสดงตรงหน้า home เลย ทำให้ผู้ใช้เห็นทั้งภาพรวมบัญชีและวิดีโอล่าสุด
              โดยไม่ต้องกดออกจากเว็บไซต์ก่อน
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-2xl border border-orange-100 bg-white/90 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-orange-700">Content Style</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">คลิปสั้นอัปเดตงานภาคสนามและประเด็นพื้นที่</p>
              </div>
              <div className="rounded-2xl border border-orange-100 bg-white/90 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-orange-700">Use Case</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">เหมาะกับดันภาพลักษณ์ที่ active และเข้าถึงง่ายกว่าฟอร์มข่าวยาว</p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <SmartLink href={TIKTOK_PROFILE_URL} className="btn-primary">
                ไปที่ TikTok
              </SmartLink>
              <SmartLink href={FACEBOOK_PAGE_URL} className="btn-outline">
                ดู Facebook ด้วย
              </SmartLink>
            </div>
          </div>

          <div className="glass-card-strong overflow-hidden p-4">
            <div className="tiktok-shell rounded-[1.75rem] border border-orange-100 bg-white p-3">
              <blockquote
                className="tiktok-embed"
                cite={TIKTOK_PROFILE_URL}
                data-unique-id="annsiriw"
                data-embed-type="creator"
                data-embed-from="oembed"
                style={{ maxWidth: "780px", minWidth: "288px", margin: "0 auto" }}
              >
                <section>
                  <a target="_blank" href={`${TIKTOK_PROFILE_URL}?refer=creator_embed`} rel="noreferrer">
                    @annsiriw
                  </a>
                </section>
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      <section className="app-container mt-12">
        <h2 className="section-title">เมนูด่วน</h2>
        <p className="section-caption">เข้าถึงบริการหลักและช่องทางสื่อสารสำคัญได้อย่างรวดเร็ว</p>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {quickLinks.map((item) => (
            <SmartLink
              key={item.title}
              href={item.href}
              className="glass-card group flex min-h-[180px] flex-col justify-between p-5 transition duration-200 hover:-translate-y-1 hover:shadow-2xl"
            >
              <div className="h-10 w-10 rounded-2xl bg-orange-50 text-center text-lg font-bold leading-10 text-orange-700">
                {item.title.slice(0, 1)}
              </div>
              <div className="mt-5">
                <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
              </div>
              <span className="mt-6 text-sm font-semibold text-orange-700 transition group-hover:text-orange-900">
                ไปที่เมนูนี้
              </span>
            </SmartLink>
          ))}
        </div>
      </section>
    </div>
  );
}
