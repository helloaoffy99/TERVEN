import type { Metadata } from "next";
import Link from "next/link";
import { Facebook, Instagram, MapPin, MessageCircle, Phone } from "lucide-react";
import { siteContact } from "@/config/site";

export const metadata: Metadata = { title: "ติดต่อ TERVÉN | TERVÉN", description: "ติดต่อ TERVÉN ผ่าน LINE, Facebook หรือ Instagram เพื่อสอบถามอสังหาริมทรัพย์", robots: { index: false, follow: false } };

export default function ContactPage() {
  return <main className="inner-page">
    <section className="page-hero compact-hero"><div className="container"><span className="section-kicker">CONTACT TERVÉN</span><h1>พูดคุยเรื่องพื้นที่ที่ใช่</h1><p>สอบถามข้อมูลอสังหาริมทรัพย์ผ่านช่องทางของ TERVÉN</p></div></section>
    <section className="container contact-page-section">
      <div className="contact-grid">
        {siteContact.lineUrl && <article><MessageCircle size={28} /><h2>LINE</h2><a href={siteContact.lineUrl} target="_blank" rel="noopener noreferrer">ติดต่อผ่าน LINE</a></article>}
        {siteContact.facebookUrl && <article><Facebook size={28} /><h2>Facebook</h2><a href={siteContact.facebookUrl} target="_blank" rel="noopener noreferrer">ติดตาม TERVÉN บน Facebook</a></article>}
        {siteContact.instagramUrl && <article><Instagram size={28} /><h2>Instagram</h2><a href={siteContact.instagramUrl} target="_blank" rel="noopener noreferrer">ติดตาม @terven.official</a></article>}
        {siteContact.phone && <article><Phone size={28} /><h2>โทรศัพท์</h2><a href={`tel:${siteContact.phone}`}>{siteContact.phone}</a></article>}
        {siteContact.officeAddress && <article><MapPin size={28} /><h2>สำนักงาน</h2><p>{siteContact.officeAddress}</p></article>}
      </div>
      <div className="contact-next"><h2>ต้องการฝากขาย?</h2><p>ดูข้อมูลที่ต้องเตรียมในแบบฟอร์มฝากขาย ระบบจะเปิดรับเมื่อการตั้งค่าและนโยบายข้อมูลพร้อม</p><Link className="dark-button" href="/sell">ดูแบบฟอร์มฝากขาย →</Link></div>
    </section>
  </main>;
}
