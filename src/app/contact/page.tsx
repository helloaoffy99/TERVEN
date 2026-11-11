import type { Metadata } from "next";
import { Facebook, Instagram, MapPin, MessageCircle, Phone } from "lucide-react";
import { siteContact } from "@/config/site";

export const metadata: Metadata = { title: "ติดต่อ TERVÉN | TERVÉN", description: "สอบถามรายละเอียดทรัพย์ ทำเล ราคา และนัดชมผ่าน LINE ของ TERVÉN", robots: { index: false, follow: false } };

export default function ContactPage() {
  return <main className="inner-page">
    <section className="page-hero compact-hero"><div className="container"><span className="section-kicker">CONTACT TERVÉN</span><h1>พูดคุยเรื่องพื้นที่ที่ใช่</h1><p>สอบถามทำเล ราคา รายละเอียดทรัพย์ หรือนัดชมกับเราได้ทาง LINE</p></div></section>
    <section className="container contact-page-section">
      <div className="contact-grid">
        {siteContact.lineUrl && <article className="contact-primary"><MessageCircle size={28} /><h2>สอบถามผ่าน LINE</h2><p>คุยเรื่องทำเล ราคา รายละเอียดทรัพย์ และนัดชม</p><a href={siteContact.lineUrl} target="_blank" rel="noopener noreferrer">ทัก LINE เพื่อสอบถาม →</a></article>}
        {siteContact.facebookUrl && <article><Facebook size={28} /><h2>Facebook</h2><p>ติดตามข่าวสารและประกาศของ TERVÉN</p><a href={siteContact.facebookUrl} target="_blank" rel="noopener noreferrer">ติดตามบน Facebook →</a></article>}
        {siteContact.instagramUrl && <article><Instagram size={28} /><h2>Instagram</h2><p>ชมภาพทรัพย์และติดตาม TERVÉN</p><a href={siteContact.instagramUrl} target="_blank" rel="noopener noreferrer">ติดตามบน Instagram →</a></article>}
        {siteContact.phone && <article><Phone size={28} /><h2>โทรศัพท์</h2><a href={`tel:${siteContact.phone}`}>{siteContact.phone}</a></article>}
        {siteContact.officeAddress && <article><MapPin size={28} /><h2>สำนักงาน</h2><p>{siteContact.officeAddress}</p></article>}
      </div>
      {siteContact.lineUrl && <div className="contact-next"><h2>ต้องการฝากขาย?</h2><p>พูดคุยเรื่องการฝากขายและข้อมูลทรัพย์เบื้องต้นกับเราทาง LINE</p><a className="dark-button" href={siteContact.lineUrl} target="_blank" rel="noopener noreferrer">ปรึกษาเรื่องฝากขายทาง LINE →</a></div>}
    </section>
  </main>;
}
