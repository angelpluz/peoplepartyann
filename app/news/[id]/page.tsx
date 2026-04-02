import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

type NewsDetailPageProps = {
  params: {
    id: string;
  };
};

type NewsItem = {
  id: number;
  title: string;
  content: string;
  imageUrl: string | null;
  createdAt: string;
};

function getRequestOrigin() {
  const requestHeaders = headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");

  if (!host) {
    throw new Error("Missing request host");
  }

  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.includes("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");

  return `${protocol}://${host}`;
}

async function getNewsById(id: number) {
  const response = await fetch(`${getRequestOrigin()}/api/news/${id}`, {
    cache: "no-store",
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Unable to load news item");
  }

  return (await response.json()) as NewsItem;
}

export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const news = await getNewsById(id);
  if (!news) notFound();

  return (
    <div className="app-container py-10">
      <article className="glass-card-strong mx-auto max-w-4xl overflow-hidden p-6 sm:p-8">
        <span className="eyebrow">News Detail</span>
        <h1 className="mt-4 text-3xl font-bold leading-tight text-slate-950 sm:text-4xl">{news.title}</h1>
        <p className="mt-3 text-sm text-slate-500">
          เผยแพร่เมื่อ{" "}
          {new Date(news.createdAt).toLocaleDateString("th-TH", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </p>

        {news.imageUrl && (
          <div className="mt-6 overflow-hidden rounded-[2rem] bg-slate-100">
            <img src={news.imageUrl} alt={news.title} className="h-auto max-h-[32rem] w-full object-cover" />
          </div>
        )}

        <div className="mt-8 whitespace-pre-wrap text-base leading-8 text-slate-700">{news.content}</div>

        <div className="mt-8">
          <Link href="/news" className="btn-outline">
            กลับไปหน้ารวมข่าว
          </Link>
        </div>
      </article>
    </div>
  );
}
