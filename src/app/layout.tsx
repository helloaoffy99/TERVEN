import type { Metadata } from "next";
import { SiteChrome } from "@/components/site-chrome";
import { AuthRedirectBridge } from "@/components/auth-redirect-bridge";
import { getSiteUrl, siteShareImage } from "@/config/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: "TERVÉN | อสังหาริมทรัพย์ที่ใช่ ในจังหวะชีวิตของคุณ",
  description:
    "ค้นหาอสังหาริมทรัพย์และฝากขายกับ TERVÉN พร้อมข้อมูลประกาศที่ผ่านการตรวจสอบและเผยแพร่",
  openGraph: {
    type: "website",
    images: [siteShareImage],
  },
  twitter: {
    card: "summary",
    images: [siteShareImage.url],
  },
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Sarabun:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body><AuthRedirectBridge /><SiteChrome>{children}</SiteChrome></body>
    </html>
  );
}
