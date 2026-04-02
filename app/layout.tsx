import type { Metadata } from "next";
import { Noto_Sans_Thai, Sora } from "next/font/google";
import "./globals.css";

const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-body",
});

const sora = Sora({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: {
    default: "เว็บไซต์สมาชิกสภาผู้แทนราษฎร",
    template: "%s | เว็บไซต์ ส.ส.",
  },
  description: "เว็บไซต์ประชาสัมพันธ์ผลงานและศูนย์รับเรื่องร้องเรียนของสมาชิกสภาผู้แทนราษฎร",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body
        className={`${notoSansThai.variable} ${sora.variable} min-h-screen bg-slate-50 text-slate-900 antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
