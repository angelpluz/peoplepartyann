import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

type NewsDetailPageProps = {
  params: {
    id: string;
  };
};

async function getNewsById(id: number) {
  return prisma.news.findUnique({
    where: { id },
  });
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
          <div className="relative mt-6 h-60 overflow-hidden rounded-[2rem] bg-slate-100 sm:h-96">
            <Image src={news.imageUrl} alt={news.title} fill className="object-cover" />
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
