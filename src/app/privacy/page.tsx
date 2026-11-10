import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "นโยบายความเป็นส่วนตัว | TERVÉN", description: "การใช้ข้อมูลในแบบฟอร์มฝากขายอสังหาริมทรัพย์ TERVÉN" };
export default function PrivacyPage() {
  const email = process.env.NEXT_PUBLIC_PRIVACY_CONTACT_EMAIL;
  return <main className="inner-page"><section className="page-hero compact-hero"><div className="container"><span className="section-kicker">PRIVACY</span><h1>นโยบายความเป็นส่วนตัว</h1><p>ข้อมูลเกี่ยวกับการรับฝากขายและการติดต่อกลับ</p></div></section><article className="container policy-content">{!email && <div className="sample-banner"><strong>ยังไม่เปิดรับข้อมูลส่วนตัว</strong><span>ผู้ดูแลต้องยืนยันช่องทางติดต่อและทบทวนนโยบายก่อนเปิดฟอร์มจริง</span></div>}<h2>ข้อมูลที่ได้รับ</h2><p>เมื่อระบบรับฝากขายเปิดใช้งานและคุณส่งฟอร์ม เราจะรับชื่อ เบอร์โทรศัพท์ LINE ID (หากระบุ) ประเภททรัพย์ ทำเล ขนาดพื้นที่ ราคาที่ต้องการขาย รายละเอียดเพิ่มเติม และเวลาที่ให้ความยินยอม</p><h2>วัตถุประสงค์</h2><p>ใช้ข้อมูลเพื่อพิจารณาทรัพย์ที่เสนอฝากขาย ติดต่อกลับ และติดตามสถานะคำขอ ผู้ดูแลที่ได้รับสิทธิ์เท่านั้นที่เข้าถึงข้อมูลนี้ได้</p><h2>การจัดเก็บและสิทธิของคุณ</h2><p>ข้อมูลอยู่ในฐานข้อมูลที่กำหนดสิทธิ์เข้าถึง ผู้ใช้ทั่วไปไม่สามารถอ่านข้อมูลผู้ฝากขายได้ คุณสามารถสอบถาม ขอแก้ไข หรือลบข้อมูลผ่านช่องทางติดต่อด้านล่าง ระยะเวลาเก็บรักษาและรายละเอียดผู้ควบคุมข้อมูลต้องได้รับการยืนยันก่อนเปิดใช้งานจริง</p>{email && <p>ติดต่อเรื่องข้อมูลส่วนตัว: <a href={`mailto:${email}`}>{email}</a></p>}<Link className="text-link" href="/sell">กลับไปหน้าฝากขาย →</Link></article></main>;
}
