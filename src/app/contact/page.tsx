import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, MessageCircle, Phone } from "lucide-react";
import { siteContact } from "@/config/site";

export const metadata: Metadata = { title: "ติดต่อ TERVÉN | TERVÉN", description: "ติดต่อ TERVÉN ผ่าน LINE เพื่อสอบถามอสังหาริมทรัพย์", robots: { index: false, follow: false } };

export default function ContactPage() {
  return <main className="inner-page"><section className="page-hero compact-hero"><div className="container"><span className="section-kicker">CONTACT TERVÉN</span><h1>พูดคุยเรื่องพื้นที่ที่ใช่</h1><p>สอบถามข้อมูลอสังหาริมทรัพย์ผ่าน LINE ของ TERVÉN</p></div></section><section className="container contact-page-section"><div className="sample-banner"><strong>เว็บไซต์พรีวิว</strong><span>ติดต่อสอบถามผ่าน LINE ได้แล้ว ส่วนแบบฟอร์มรับฝากขายยังไม่เปิดใช้งาน</span></div><div className="contact-grid"><article><Phone size={28} /><h2>โทรศัพท์</h2>{siteContact.phone ? <a href={`tel:${siteContact.phone}`}>{siteContact.phone}</a> : <p>ยังไม่ได้ตั้งค่าเบอร์โทรศัพท์</p>}</article><article><MessageCircle size={28} /><h2>LINE</h2>{siteContact.lineUrl ? <a href={siteContact.lineUrl} target="_blank" rel="noopener noreferrer">ติดต่อผ่าน LINE</a> : <p>ยังไม่ได้ตั้งค่า LINE</p>}</article><article><MapPin size={28} /><h2>สำนักงาน</h2><p>{siteContact.officeAddress ?? "ยังไม่ได้ยืนยันที่ตั้งสำนักงาน"}</p></article></div><div className="contact-next"><h2>ต้องการฝากขาย?</h2><p>ดูข้อมูลที่ต้องเตรียมในแบบฟอร์มฝากขาย ระบบจะเปิดรับเมื่อการตั้งค่าและนโยบายข้อมูลพร้อม</p><Link className="dark-button" href="/sell">ดูแบบฟอร์มฝากขาย →</Link></div></section></main>;
}
