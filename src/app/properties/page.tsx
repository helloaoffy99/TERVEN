import type { Metadata } from "next";
import { Suspense } from "react";
import { PropertyExplorer } from "@/components/property-explorer";
import { listPublicProperties } from "@/lib/live-properties";

export const metadata: Metadata = {
  title: "ค้นหาอสังหาริมทรัพย์ | TERVÉN",
  description: "ค้นหาอสังหาริมทรัพย์ที่เผยแพร่แล้วตามทำเล ประเภท และช่วงราคา",
};

export default async function PropertiesPage() {
  const properties = await listPublicProperties();
  return <main className="inner-page">
    <section className="page-hero compact-hero"><div className="container"><span className="section-kicker">CURATED PROPERTIES</span><h1>ค้นหาพื้นที่ที่ใช่</h1><p>สำรวจประกาศอสังหาริมทรัพย์ที่เผยแพร่แล้ว</p></div></section>
    <Suspense fallback={<div className="container page-loading" role="status">กำลังเตรียมรายการ…</div>}><PropertyExplorer properties={properties} /></Suspense>
  </main>;
}
